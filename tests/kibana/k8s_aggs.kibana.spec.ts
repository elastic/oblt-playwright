import { Page } from '@playwright/test';
import { test } from '../../src/pom/page.fixtures.ts';
import { 
  getDatePickerLogMessageServerless, 
  fetchClusterData, 
  importDashboards,
  printResults,
  selectDefaultSpace, 
  testStep, 
  writeJsonReport
 } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';
import DashboardPage from '../../src/pom/pages/dashboard.page.ts';
import DatePicker from '../../src/pom/components/date_picker.component.ts';
import HeaderBar from '../../src/pom/components/header_bar.component.ts';

let clusterData: any;
let reports: string[] = [];
const testStartTime: number = Date.now();

test.beforeAll(async ({ browser }) => {
  await importDashboards(browser, 'src/data/dashboards/dashboards.ndjson');
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ page, sideNav, spaceSelector }) => {
  await page.goto('/');
  await selectDefaultSpace(clusterData.version.build_flavor, page);
  await page.goto('/app/dashboards');
});

test.afterEach('Log test results', async ({}, testInfo) => {
  const stepData = (testInfo as any).stepData;
  const reportFiles = await writeJsonReport(clusterData, testInfo, testStartTime, stepData);
  reports.push(...reportFiles.filter(item => typeof item === 'string'));
});

test.afterAll('Print test results', async ({}) => {
  await printResults(reports);
});

async function testBody(title: string, page: Page, dashboardPage: DashboardPage, datePicker: DatePicker, headerBar: HeaderBar) {
  let stepData: object[] = [];
  await testStep('step01', stepData, page, async () => {
    await dashboardPage.assertVisibilityHeading();
    await dashboardPage.assertVisibilityTable();
    logger.info('Searching for the dashboard: ' + title);
    await dashboardPage.searchDashboard(title);
    await page.getByRole('link', { name: title }).click();
  }, 'Searching for the dashboard');

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
  }, 'Setting search interval and ensuring visualizations are loaded');
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