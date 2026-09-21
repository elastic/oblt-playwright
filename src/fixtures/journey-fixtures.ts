import { Page, TestInfo } from '@playwright/test';
import { Logger } from 'winston';
import { CLUSTER_NAME } from '../env';
import { writeJsonReport } from '../helpers/reporter';
import { uploadFailureScreenshot } from '../helpers/screenshot';
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

  return uploadFailureScreenshot(log, png, fileName);
}

export const test = base.extend<{ reportTestResult: void }>({
  // Automatically write the result after each test finishes.
  reportTestResult: [
    async ({ log, page }, use, testInfo) => {
      const testStartTime = new Date().toISOString();

      await use();

      const screenshotUrl =
        testInfo.status === testInfo.expectedStatus
          ? undefined
          : await captureFailureScreenshot(log, page, testInfo, testStartTime);

      await writeJsonReport(
        log, { cluster_name: CLUSTER_NAME }, testInfo, testStartTime,
        undefined, undefined, undefined, undefined, { screenshotUrl },
      );
    },
    { auto: true },
  ],
});
