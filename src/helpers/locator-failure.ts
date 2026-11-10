import { Page } from '@playwright/test';
import { Logger } from 'winston';
import { stripAnsi } from './test-utils';

// Tells a locator that stopped matching (Kibana changed its UI) apart from a
// product failure, using the page as it was when the test failed.
//
// Only the two locator styles the journey policy allows are understood:
// `getByTestId('x')` and `getByRole('r', { name: 'y' })`, chained or not.
// Anything else (CSS, XPath, `.filter()`, regex names) is reported as `unknown`.
export type LocatorFailure = {
  locator: string;
  kind: 'locator' | 'product' | 'unknown';
  candidates: string[];
  url: string;
};

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

// Runs in the page. Segments are matched page-wide rather than within their
// container, which is enough to tell "nothing like it exists" from "it exists".
function inspectPage(segments: Segment[]) {
  const IMPLICIT_ROLES: Record<string, string> = {
    link: 'a[href]',
    button: 'button',
    heading: 'h1,h2,h3,h4,h5,h6',
    textbox: 'input:not([type]),input[type="text"],input[type="search"],textarea',
    checkbox: 'input[type="checkbox"]',
    combobox: 'select',
  };
  const tokens = (value: string) =>
    value
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 3);
  const accessibleName = (el: Element) =>
    (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().replace(/\s+/g, ' ');
  const visible = (el: Element) =>
    (el as HTMLElement).checkVisibility?.() ?? el.getClientRects().length > 0;
  const usable = (el: Element) => visible(el) && !(el as HTMLButtonElement).disabled;

  const url = location.href;
  const toast = !!document.querySelector(
    '[data-test-subj="globalToastList"] .euiToast--danger, [data-test-subj="globalToastList"] [data-euiicon-type="error"]',
  );
  // Every Kibana app lives under /app/. A login page or error page does not.
  const leftApp = !/\/app\//.test(location.pathname);
  if (toast || leftApp) {
    return { kind: 'product' as const, candidates: [], url };
  }

  for (const [index, segment] of segments.entries()) {
    const isLast = index === segments.length - 1;
    let matches: Element[];
    let candidates: string[];

    if (segment.type === 'testId') {
      const all = [...document.querySelectorAll('[data-test-subj]')];
      matches = all.filter((el) => el.getAttribute('data-test-subj') === segment.value);
      const wanted = new Set(tokens(segment.value));
      candidates = [
        ...new Set(
          all
            .map((el) => el.getAttribute('data-test-subj') as string)
            .filter((value) => value !== segment.value),
        ),
      ]
        .map((value) => ({ value, shared: tokens(value).filter((t) => wanted.has(t)).length }))
        .filter(({ shared }) => shared > 0)
        .sort((a, b) => b.shared - a.shared)
        .map(({ value }) => value)
        .slice(0, 10);
    } else {
      const selector = [`[role="${segment.role}"]`, IMPLICIT_ROLES[segment.role]]
        .filter(Boolean)
        .join(',');
      const withRole = [...document.querySelectorAll(selector)];
      const wanted = segment.name.toLowerCase();
      matches = withRole.filter((el) => {
        const name = accessibleName(el).toLowerCase();
        return segment.exact ? name === wanted : name.includes(wanted);
      });
      candidates = [...new Set(withRole.map(accessibleName).filter(Boolean))].slice(0, 10);
      // No element has this role at all: the role itself is the question,
      // not the name.
      if (withRole.length === 0) {
        return { kind: 'unknown' as const, candidates: [], url };
      }
    }

    if (matches.length === 0) {
      return { kind: 'locator' as const, candidates, url };
    }
    if (isLast && !matches.some(usable)) {
      return { kind: 'product' as const, candidates: [], url };
    }
  }

  return { kind: 'unknown' as const, candidates: [], url };
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
    // `page.evaluate` has no timeout and would hang on a crashed page.
    const result = await Promise.race([
      page.evaluate(inspectPage, segments),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timed out')), 10_000),
      ),
    ]);
    return { locator, ...result };
  } catch (error) {
    log.warn(`Could not classify the failure: ${String(error)}`);
    return undefined;
  }
}
