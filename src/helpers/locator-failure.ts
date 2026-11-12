import type { Locator, Page } from '@playwright/test';
import { Logger } from 'winston';
import { stripAnsi } from './test-utils';

// Tells a locator that stopped matching (Kibana changed its UI) apart from a
// product failure, using the page as it was when the test failed.
//
// Only the two locator styles the journey policy allows are understood:
// `getByTestId('x')` and `getByRole('r', { name: 'y' })`, chained or not.
// Each segment is checked inside the one before it; only the candidates
// suggested for a missing segment come from the whole page.
// Anything else (CSS, XPath, `.filter()`, regex names) is reported as `unknown`.
export type LocatorFailure = {
  locator: string;
  kind: 'locator' | 'product' | 'unknown';
  candidates: string[];
  url: string;
};

type AriaRole = Parameters<Page['getByRole']>[0];

type Segment =
  | { type: 'testId'; value: string }
  | { type: 'role'; role: string; name: string; exact: boolean };

const QUOTED = String.raw`'((?:[^'\\]|\\.)*)'`;
const TEST_ID = new RegExp(String.raw`getByTestId\(${QUOTED}\)`, 'y');
const ROLE = new RegExp(
  String.raw`getByRole\('([^']+)', \{ name: ${QUOTED}(, exact: true)? \}\)`,
  'y',
);

const unquote = (value: string) => value.replace(/\\(.)/g, '$1');

// The locator Playwright was waiting for: the `Locator:` line of an assertion
// failure, the `waiting for` line of an action timeout, or the subject of a
// strict mode violation.
function extractLocator(message: string): string | undefined {
  const text = stripAnsi(message);
  const match =
    /^Locator: (.+)$/m.exec(text) ??
    /waiting for (\S.*)$/m.exec(text) ??
    /strict mode violation: (.+?) resolved to/.exec(text);
  return match?.[1].trim();
}

// Splits `a.b.c` into segments. Returns undefined when any part is not a
// supported locator, so the caller reports `unknown`.
function parseSegments(locator: string): Segment[] | undefined {
  const segments: Segment[] = [];
  let position = 0;

  while (position < locator.length) {
    if (segments.length > 0) {
      // A chain continues with `.`; anything else is a suffix such as
      // ` to be visible` and ends the locator.
      if (locator[position] !== '.') {
        break;
      }
      position++;
    }

    TEST_ID.lastIndex = position;
    ROLE.lastIndex = position;
    const testId = TEST_ID.exec(locator);
    const role = testId ? null : ROLE.exec(locator);

    if (testId) {
      segments.push({ type: 'testId', value: unquote(testId[1]) });
      position = TEST_ID.lastIndex;
    } else if (role) {
      segments.push({ type: 'role', role: role[1], name: unquote(role[2]), exact: !!role[3] });
      position = ROLE.lastIndex;
    } else {
      return undefined;
    }
  }

  // Whatever follows the chain must be a suffix, not a further call such as
  // `.filter(...)` that the segments above would silently ignore.
  const rest = locator.slice(position);
  return rest === '' || rest.startsWith(' ') ? segments : undefined;
}

const tokens = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);

// The values most similar to `wanted`, best first. Similarity is the number of
// tokens they share; values sharing fewer than `minShared` are dropped.
function rank(wanted: string, values: string[], minShared: number): string[] {
  const wantedTokens = new Set(tokens(wanted));
  return [...new Set(values)]
    .filter((value) => value !== wanted)
    .map((value) => ({ value, shared: tokens(value).filter((t) => wantedTokens.has(t)).length }))
    .filter(({ shared }) => shared >= minShared)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 10)
    .map(({ value }) => value);
}

// Rebuilds the locator with Playwright's own matching, so label, aria-labelledby
// and implicit roles are resolved as they were when the test ran. Hidden
// elements count: this is about whether the element exists, not whether it is shown.
function toLocator(page: Page, segments: Segment[]): Locator {
  return segments.reduce<Page | Locator>(
    (scope, segment) =>
      segment.type === 'testId'
        ? scope.getByTestId(segment.value)
        : scope.getByRole(segment.role as AriaRole, {
            name: segment.name,
            exact: segment.exact,
            includeHidden: true,
          }),
    page,
  ) as Locator;
}

// What the page has instead of the segment that matched nothing: test ids that
// share a token with it, or the accessible names of elements with its role.
// Both are read page-wide.
async function candidates(page: Page, segment: Segment): Promise<string[]> {
  if (segment.type === 'testId') {
    const ids = await page
      .locator('[data-test-subj]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-test-subj') as string));
    return rank(segment.value, ids, 1);
  }

  const snapshot = await page.locator('body').ariaSnapshot();
  const names = [...snapshot.matchAll(/^\s*- '?(\w+) ("(?:[^"\\]|\\.)*")/gm)]
    .filter((match) => match[1] === segment.role)
    .map((match) => JSON.parse(match[2]) as string)
    .filter((name) => name !== '');
  return rank(segment.name, names, 0);
}

async function inspect(
  page: Page,
  segments: Segment[],
): Promise<Pick<LocatorFailure, 'kind' | 'candidates'>> {
  // Every Kibana app lives under /app/. A login page or error page does not.
  const leftApp = !new URL(page.url()).pathname.includes('/app/');
  const errorToast = page
    .getByTestId('globalToastList')
    .locator('.euiToast--danger, [data-euiicon-type="error"]');
  if (leftApp || (await errorToast.count()) > 0) {
    return { kind: 'product', candidates: [] };
  }

  for (let i = 1; i <= segments.length; i++) {
    if ((await toLocator(page, segments.slice(0, i)).count()) === 0) {
      const similar = await candidates(page, segments[i - 1]);
      // No element has this role at all: the role itself is the question, not the name.
      const noRole = segments[i - 1].type === 'role' && similar.length === 0;
      return { kind: noRole ? 'unknown' : 'locator', candidates: similar };
    }
  }

  // The element exists, so the test failed waiting for it to be usable.
  const visible = toLocator(page, segments).filter({ visible: true });
  if ((await visible.count()) === 0 || !(await visible.first().isEnabled())) {
    return { kind: 'product', candidates: [] };
  }
  return { kind: 'unknown', candidates: [] };
}

export async function classifyLocatorFailure(
  log: Logger,
  page: Page,
  errorMessage: string | undefined,
): Promise<LocatorFailure | undefined> {
  const locator = errorMessage && extractLocator(errorMessage);
  if (!locator) {
    return undefined;
  }

  const segments = parseSegments(locator);
  if (!segments) {
    return { locator, kind: 'unknown', candidates: [], url: page.url() };
  }

  try {
    // Reading the page has no timeout of its own and would hang on a crashed page.
    const result = await Promise.race([
      inspect(page, segments),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timed out')), 10_000),
      ),
    ]);
    return { locator, url: page.url(), ...result };
  } catch (error) {
    log.warn(`Could not classify the failure: ${String(error)}`);
    return undefined;
  }
}
