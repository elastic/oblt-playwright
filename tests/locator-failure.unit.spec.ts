import { expect, test, type Page } from '@playwright/test';
import { createLogger } from 'winston';
import { classifyLocatorFailure } from 'oblt-playwright/helpers/locator-failure';

const log = createLogger({ silent: true });
const fast = { timeout: 100 };

// Serves `body` at a Kibana-like URL without touching the network.
async function serve(page: Page, body: string, path = '/app/test') {
  const url = `http://kibana.test${path}`;
  await page.route(url, (route) => route.fulfill({ contentType: 'text/html', body }));
  await page.goto(url);
}

// Runs a Playwright call that must fail and classifies its error, so the
// classifier is tested against the messages Playwright actually prints.
async function classifyFailure(page: Page, call: () => Promise<unknown>) {
  try {
    await call();
  } catch (error) {
    return classifyLocatorFailure(log, page, (error as Error).message);
  }
  throw new Error('The call was expected to fail');
}

test('a test id similar to one on the page is a locator failure', async ({ page }) => {
  await serve(page, '<div data-test-subj="discoverDocTable"></div>');
  const result = await classifyFailure(page, () => page.getByTestId('discoverDocTabel').click(fast));
  expect(result).toMatchObject({ kind: 'locator', candidates: ['discoverDocTable'] });
});

test('a test id with nothing similar on the page is unknown', async ({ page }) => {
  await serve(page, '<div data-test-subj="discoverDocTable"></div>');
  const result = await classifyFailure(page, () => expect(page.getByTestId('zzzNothing')).toBeVisible(fast));
  expect(result).toMatchObject({ kind: 'unknown', candidates: [] });
});

test('a strict mode violation on an action is a locator failure', async ({ page }) => {
  await serve(page, '<button data-test-subj="save">A</button><button data-test-subj="save">B</button>');
  const result = await classifyFailure(page, () => page.getByTestId('save').click(fast));
  expect(result).toMatchObject({ kind: 'locator' });
});

test('a strict mode violation on an assertion is a locator failure', async ({ page }) => {
  await serve(page, '<button data-test-subj="save">A</button><button data-test-subj="save">B</button>');
  const result = await classifyFailure(page, () => expect(page.getByTestId('save')).toBeVisible(fast));
  expect(result).toMatchObject({ kind: 'locator' });
});

test('a timed-out waitForResponse is not classified', async ({ page }) => {
  await serve(page, '<div></div>');
  const result = await classifyFailure(page, () => page.waitForResponse('**/never', fast));
  expect(result).toBeUndefined();
});

test('a chained test id that exists outside its parent is a locator failure', async ({ page }) => {
  await serve(page, '<div data-test-subj="panel"></div><button data-test-subj="save">Save</button>');
  const result = await classifyFailure(page, () => page.getByTestId('panel').getByTestId('save').click(fast));
  expect(result).toMatchObject({ kind: 'locator' });
  expect(result?.candidates).toContain('save');
});

test('a Kibana error screen is a product failure', async ({ page }) => {
  await serve(page, '<div data-test-subj="appNotFoundPageContent"></div>');
  const result = await classifyFailure(page, () => page.getByTestId('save').click(fast));
  expect(result).toMatchObject({ kind: 'product' });
});

test('an error toast is a product failure', async ({ page }) => {
  await serve(page, '<div data-test-subj="globalToastList"><div class="euiToast--danger"></div></div>');
  const result = await classifyFailure(page, () => page.getByTestId('save').click(fast));
  expect(result).toMatchObject({ kind: 'product' });
});

test('a page outside /app/ is a product failure', async ({ page }) => {
  await serve(page, '<div></div>', '/login');
  const result = await classifyFailure(page, () => page.getByTestId('save').click(fast));
  expect(result).toMatchObject({ kind: 'product' });
});

test('a hidden element is a product failure', async ({ page }) => {
  await serve(page, '<button data-test-subj="save" hidden>Save</button>');
  const result = await classifyFailure(page, () => expect(page.getByTestId('save')).toBeVisible(fast));
  expect(result).toMatchObject({ kind: 'product' });
});

test('a role name missing from the page is a locator failure', async ({ page }) => {
  await serve(page, '<button>Submit</button>');
  const result = await classifyFailure(page, () => page.getByRole('button', { name: 'Save' }).click(fast));
  expect(result).toMatchObject({ kind: 'locator', candidates: ['Submit'] });
});

test('a role no element on the page has is unknown', async ({ page }) => {
  await serve(page, '<div></div>');
  const result = await classifyFailure(page, () => page.getByRole('button', { name: 'Save' }).click(fast));
  expect(result).toMatchObject({ kind: 'unknown' });
});

test('an unsupported locator is unknown', async ({ page }) => {
  await serve(page, '<div></div>');
  const result = await classifyFailure(page, () => page.locator('.save').click(fast));
  expect(result).toMatchObject({ locator: "locator('.save')", kind: 'unknown', candidates: [] });
});
