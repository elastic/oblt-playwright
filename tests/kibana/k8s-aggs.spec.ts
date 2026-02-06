import { Page } from '@playwright/test';
import { test } from '../../src/pom/page-fixtures.ts';
import { selectDefaultSpace, testStep, getDatePickerLogMessage } from "../../src/helpers/test-utils.ts";
import { fetchClusterData, getDocCount } from "../../src/helpers/api-client.ts";
import { writeJsonReport, printResults } from "../../src/helpers/reporter.ts";
import { importDashboards } from "../../src/helpers/setup.ts";
import DashboardPage from '../../src/pom/pages/dashboard.page.ts';
import DatePicker from '../../src/pom/components/date-picker.component.ts';
import HeaderBar from '../../src/pom/components/header-bar.component.ts';
import { Logger } from "winston";

let clusterData: any;
let doc_count: object;
let reports: string[] = [];
const testStartTime: string = new Date().toISOString();

test.beforeAll(async ({ browser, log }) => {
  await importDashboards(log, browser, 'src/data/saved-objects/k8s-dashboards.ndjson');
  log.info('Fetching cluster data');
  clusterData = await fetchClusterData();
  doc_count = await getDocCount();
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await selectDefaultSpace(clusterData.version.build_flavor, page);
  await page.goto('/app/dashboards');
});

test.afterEach('Log test results', async ({ log }, testInfo) => {
  const stepData = (testInfo as any).stepData;
  const reportFiles = await writeJsonReport(log, clusterData, testInfo, testStartTime, doc_count, stepData);
  reports.push(...reportFiles.filter(item => typeof item === 'string'));
});

test.afterAll('Print test results', async ({}) => {
  await printResults(reports);
});

async function testBody(title: string, page: Page, dashboardPage: DashboardPage, datePicker: DatePicker, headerBar: HeaderBar, log: Logger) {
  let stepData: object[] = [];
  await testStep('step01', stepData, page, async () => {
    await dashboardPage.assertVisibilityHeading();
    await dashboardPage.assertVisibilityTable();
    log.info('Searching for the dashboard: ' + title);
    await dashboardPage.searchDashboard(title);
    await page.getByRole('link', { name: title }).click();
  }, 'Searching for the dashboard');

  await testStep('step02', stepData, page, async () => {
    log.info(`${getDatePickerLogMessage()} and asserting the visualization: ` + title);
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
    test.afterEach('Write file report', async ({ log }, testInfo) => {
      const stepData = (testInfo as any).stepData || [];
      await writeJsonReport(log, clusterData, testInfo, testStartTime, stepData);
    });
    test(`${title}`, async ({ page, dashboardPage, datePicker, headerBar, log }, testInfo) => {
      const stepData = await testBody(title, page, dashboardPage, datePicker, headerBar, log);
      (testInfo as any).stepData = stepData;
    });
  });
});