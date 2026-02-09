import { test } from 'oblt-playwright/pom/page-fixtures';
import { selectDefaultSpace, testStep } from 'oblt-playwright/helpers/test-utils';
import { fetchClusterData, getDocCount } from 'oblt-playwright/helpers/api-client';
import { writeJsonReport, printResults } from 'oblt-playwright/helpers/reporter';

let clusterData: any;
let doc_count: object;
let reports: string[] = [];
const testStartTime: string = new Date().toISOString();

test.beforeAll('Fetch cluster data', async ({ log }) => {
  log.info('Fetching cluster data');
  clusterData = await fetchClusterData();
  doc_count = await getDocCount();
});

test.beforeEach(async ({ page, sideNav, log }) => {
  log.info('Selecting the default Kibana space');
  await sideNav.goto();
  await selectDefaultSpace(clusterData.version.build_flavor, page);
});

test.afterEach('Log test results', async ({ log }, testInfo) => {
  const stepData = (testInfo as any).stepData;
  const reportFiles = await writeJsonReport(log, clusterData, testInfo, testStartTime, doc_count, stepData);
  reports.push(...reportFiles.filter(item => typeof item === 'string'));
});

test.afterAll('Print test results', async ({}) => {
  await printResults(reports);
});

test('Data Set Quality', async ({ datePicker, headerBar, datasetsPage, notifications, page, log }, testInfo) => {
  let stepData: object[] = [];
  (testInfo as any).stepData = stepData;

  await testStep('step01', stepData, page, async () => {
    log.info ('Navigating to the "Data Set Quality" page');
    await page.goto('/app/management/data/data_quality');
    log.info('Checking quality statistics...');
    await Promise.race([
      Promise.all([
      datasetsPage.assertVisibilityQualityStatistics(),
      datasetsPage.assertVisibilityStatistics(),
      datasetsPage.assertVisibilityTable(),
      headerBar.assertLoadingIndicator()
      ]),
    notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      })
    ]);
    }, 'Navigating to the "Data Set Quality" page and asserting visibility of elements');
  (testInfo as any).stepData = stepData;

  log.info('Waiting for 15s before proceeding to the next step...');
  await page.waitForTimeout(15000);

  await testStep('step02', stepData, page, async () => {
    log.info ('Setting search interval');
    await datePicker.setInterval();
    await headerBar.assertVisibleLoadingIndicator();
    log.info('Checking quality statistics...');
    await Promise.race([
      Promise.all([
      datasetsPage.assertVisibilityQualityStatistics(),
      datasetsPage.assertVisibilityStatistics(),
      datasetsPage.assertVisibilityTable(),
      headerBar.assertLoadingIndicator()
    ]),
    notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      })
    ]);
    }, 'Setting custom search interval and asserting visibility of visual elements');
});