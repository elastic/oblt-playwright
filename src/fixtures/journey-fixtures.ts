import { writeJsonReport } from '../helpers/reporter';
import { test as base } from './page-fixtures';

export const test = base.extend<{ reportTestResult: void }>({
  // Automatically write the result after each test finishes.
  reportTestResult: [
    async ({ log }, use, testInfo) => {
      const testStartTime = new Date().toISOString();

      await use();

      await writeJsonReport(log, undefined, testInfo, testStartTime);
    },
    { auto: true },
  ],
});
