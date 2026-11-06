import { Page, TestInfo } from '@playwright/test';
import { Logger } from 'winston';
import { CLUSTER_NAME } from '../env';
import { writeJsonReport } from '../helpers/reporter';
import { SCREENSHOT_FILE, uploadFile } from '../helpers/kibana-files';
import { test as base } from './page-fixtures';

// Screenshots are taken here rather than through Playwright's `screenshot`
// option because journeys run in a container where `test-results` sits on the
// pod's ephemeral filesystem and is thrown away with the pod.
async function captureFailureScreenshot(
  log: Logger,
  page: Page,
  testInfo: TestInfo,
  testStartTime: string,
) {
  let png: Buffer;
  try {
    png = await page.screenshot({ timeout: 10_000 });
  } catch (error) {
    log.warn(`Could not capture the failure screenshot: ${String(error)}`);
    return undefined;
  }

  const fileName = [CLUSTER_NAME, testInfo.title, testStartTime]
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  return uploadFile(log, png, `${fileName}.png`, SCREENSHOT_FILE);
}

export const test = base.extend<{ reportTestResult: void }>({
  // Automatically write the result after each test finishes.
  reportTestResult: [
    async ({ log, page }, use, testInfo) => {
      const testStartTime = new Date().toISOString();

      await use();

      const didFail = testInfo.status !== testInfo.expectedStatus;
      const screenshotUrl = didFail
        ? await captureFailureScreenshot(log, page, testInfo, testStartTime)
        : undefined;

      // Playwright writes the trace when the context closes, after this
      // fixture. The upload-report teardown finds it in this directory.
      const traceDir = didFail ? testInfo.outputDir : undefined;

      await writeJsonReport(
        log, { cluster_name: CLUSTER_NAME }, testInfo, testStartTime,
        undefined, undefined, undefined, undefined, { screenshotUrl, traceDir },
      );
    },
    { auto: true },
  ],
});
