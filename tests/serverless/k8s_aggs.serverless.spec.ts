import { Page } from '@playwright/test';
import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { 
  getDatePickerLogMessageServerless, 
  fetchClusterData, 
  importDashboard,
  spaceSelectorServerless, 
  testStep, 
  writeJsonReport
 } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';
import DashboardPage from '../../src/pom/serverless/pages/dashboard.page.ts';
import DatePicker from '../../src/pom/serverless/components/date_picker.component.ts';
import HeaderBar from '../../src/pom/serverless/components/header_bar.component.ts';

let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll(async ({ browser }) => {
  await importDashboard(browser, 'src/data/dashboards/k8s_aggs_dashboard.ndjson');
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ page, sideNav, spaceSelector }) => {
  await page.goto('/');
  await spaceSelectorServerless(sideNav, spaceSelector);
  await page.goto('/app/dashboards');
});

async function testBody(title: string, page: Page, dashboardPage: DashboardPage, datePicker: DatePicker, headerBar: HeaderBar) {
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
    await headerBar.assertVisibleLoadingIndicator();
    await Promise.race([
      Promise.all([
        dashboardPage.assertVisibilityVisualization(title),
        headerBar.assertLoadingIndicator()
      ]),
      dashboardPage.assertAlreadyClosedError(title).then(() => {
        throw new Error(`Test is failed due to an embedded error when loading visualization: 'Already closed, can't increment ref count'`);
        }),
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
    test(`${title}`, async ({ page, dashboardPage, datePicker, headerBar }, testInfo) => {
      await testBody(title, page, dashboardPage, datePicker, headerBar).then((result) => {
      (testInfo as any).stepData = result;
      })
    });
  });
});