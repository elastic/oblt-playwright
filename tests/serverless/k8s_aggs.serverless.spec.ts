import { Page } from '@playwright/test';
import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { getDatePickerLogMessageServerless, fetchClusterData, spaceSelectorServerless, testStep, writeJsonReport } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';
import DashboardPage from '../../src/pom/serverless/pages/dashboard.page.ts';
import DatePicker from '../../src/pom/serverless/components/date_picker.component.ts';

let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/app/management/kibana/objects');
  logger.info('Checking if Playwright dashboards are available');
  await page.locator('xpath=//input[@data-test-subj="savedObjectSearchBar"]').fill('Playwright');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  const noItems = await page.locator('xpath=//div[@data-test-subj="savedObjectsTable"]//span[contains(text(), "No items found")]').isVisible();
  if (noItems) {
    logger.info('Importing dashboards...');
    await page.getByRole('button', { name: 'Import' }).click();
    await page.locator('xpath=//input[@type="file"]').setInputFiles('../../src/data/dashboards/dashboards.ndjson');
    await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Import")]').click();
    await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Done")]').click();
  } else {
    logger.info('Dashboards already exist.');
  }
  await context.close();

  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ page, sideNav, spaceSelector }) => {
  await page.goto('/');
  await spaceSelectorServerless(sideNav, spaceSelector);
  await page.goto('/app/dashboards');
});

async function testBody(title: string, page: Page, dashboardPage: DashboardPage, datePicker: DatePicker) {
  let stepData: object[] = [];
  await testStep('step01', stepData, page, async () => {
    await dashboardPage.assertVisibilityHeading();
    await dashboardPage.assertVisibilityTable();
    logger.info('Searching for the dashboard: ' + title);
    await dashboardPage.searchDashboard(title);
    await page.getByRole('link', { name: title }).click();
  });
  await testStep('step02', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessageServerless()} and asserting the visualization: ` + title);
    await datePicker.setInterval();
    await Promise.race([
      dashboardPage.assertVisibilityVisualization(title),
      dashboardPage.assertNoData(title).then(() => {
        throw new Error('Test is failed due to not available data');
      })
    ])
  });
  return stepData;
}

[
  { title: "Average container CPU core usage in ns" },
  { title: "Average container memory usage in bytes" },
  { title: "CPU usage per container of the total node cpu" },
  { title: "CPU usage per pod of the total node cpu" },
  { title: "Memory usage per container of the total node memory" },
  { title: "Memory usage per pod of the total node memory" },
  { title: "Percentile CPU Usage per container" },
].forEach(({ title }) => {
  test.describe(() => {
    test.afterEach('Write file report', async ({}, testInfo) => {
      const stepData = (testInfo as any).stepData;
      await writeJsonReport(clusterData, testInfo, testStartTime, stepData);
    });
    test(`${title}`, async ({ page, dashboardPage, datePicker }, testInfo) => {
      await testBody(title, page, dashboardPage, datePicker).then((result) => {
      (testInfo as any).stepData = result;
      })
    });
  });
});