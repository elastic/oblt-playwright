import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { 
  fetchClusterData, 
  getDatePickerLogMessageServerless, 
  printResults, 
  spaceSelectorServerless, 
  testStep, 
  writeJsonReport 
} from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let clusterData: any;
let reports: string[] = [];
const testStartTime: number = Date.now();

test.beforeAll('Fetch cluster data', async ({}) => {
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ discoverPage, page, sideNav, spaceSelector }) => {
  logger.info('Selecting the default Kibana space');
  await sideNav.goto();
  await spaceSelectorServerless(sideNav, spaceSelector);
  logger.info('Navigating to the "Discover" section');
  await page.goto('/app/discover');
  logger.info('Selecting the "Logs" data view');
  await discoverPage.selectLogsDataView();
});

test.afterEach('Log test results', async ({}, testInfo) => {
  const stepData = (testInfo as any).stepData;
  const reportFiles = await writeJsonReport(clusterData, testInfo, testStartTime, stepData);
  reports.push(...reportFiles.filter(item => typeof item === 'string'));
});

test.afterAll('Print test results', async ({}) => {
  await printResults(reports);
});

test('Discover - All logs', async ({datePicker, discoverPage, headerBar, notifications, page}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessageServerless()}, asserting visibility of the chart, canvas, and data grid row`);
    await datePicker.setInterval();
    await headerBar.assertVisibleLoadingIndicator();
    await Promise.race([
      Promise.all([
        discoverPage.assertChartIsRendered(),
        discoverPage.assertVisibilityCanvas(),
        discoverPage.assertVisibilityDataGridRow(),
        headerBar.assertLoadingIndicator()
      ]),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      }),
      notifications.assertErrorIncrementCount().then(() => {
        throw new Error(`Test is failed: Error loading data in index logs-*. already closed, can't increment ref count`);
      })
    ]);
  }, 'Selecting "*logs" data view, setting search interval and asserting canvas visibility');
  (testInfo as any).stepData = stepData;
});

test('Discover - Field Statistics', async ({datePicker, discoverPage, headerBar, notifications, page}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessageServerless()}, asserting visibility of the chart, canvas, and data grid row`);
    await datePicker.setInterval();
    await headerBar.assertVisibleLoadingIndicator();
    await Promise.race([
      Promise.all([
        await discoverPage.assertChartIsRendered(),
        await discoverPage.assertVisibilityCanvas(),
        await discoverPage.assertVisibilityDataGridRow(),
        headerBar.assertLoadingIndicator()
      ]),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      }),
      notifications.assertErrorIncrementCount().then(() => {
        throw new Error(`Test is failed: Error loading data in index logs-*. already closed, can't increment ref count`);
      })
    ]);
  }, 'Selecting "*logs" data view, setting search interval and asserting canvas visibility');

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step02', stepData, page, async () => {
    logger.info('Navigating to the "Field statistics" tab and asserting visibility of the document count');
    await discoverPage.clickFieldStatsTab();
    await Promise.race([
      Promise.all([
        discoverPage.assertVisibilityFieldStatsDocCount(),
        headerBar.assertLoadingIndicator()
      ]),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      }),
      notifications.assertErrorIncrementCount().then(() => {
        throw new Error(`Test is failed: Error loading data in index logs-*. already closed, can't increment ref count`);
      })
    ]);
  }, 'Navigating to the "Field Statistics" tab and asserting doc count');
  (testInfo as any).stepData = stepData;
});

test('Discover - Patterns', async ({datePicker, discoverPage, headerBar, notifications, page}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessageServerless()}, asserting visibility of the chart, canvas, and data grid row`);
    await datePicker.setInterval();
    await headerBar.assertVisibleLoadingIndicator();
    await Promise.race([
      Promise.all([
        await discoverPage.assertChartIsRendered(),
        await discoverPage.assertVisibilityCanvas(),
        await discoverPage.assertVisibilityDataGridRow(),
        headerBar.assertLoadingIndicator()
      ]),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      }),
      notifications.assertErrorIncrementCount().then(() => {
        throw new Error(`Test is failed: Error loading data in index logs-*. already closed, can't increment ref count`);
      })
    ]);
  }, 'Selecting "*logs" data view, setting search interval and asserting canvas visibility');

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step02', stepData, page, async () => {
    logger.info('Navigating to the "Patterns" tab and asserting visibility of the patterns row toggle');
    await discoverPage.clickPatternsTab();
    await Promise.race([
      Promise.all([
        discoverPage.assertVisibilityPatternsRowToggle(),
        headerBar.assertLoadingIndicator()
      ]),
      discoverPage.assertPatternsNotLoaded().then(() => {
        throw new Error('Test is failed: Error loading categories');
      }),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      }),
      notifications.assertErrorIncrementCount().then(() => {
        throw new Error(`Test is failed: Error loading data in index logs-*. already closed, can't increment ref count`);
      })
    ]);
    logger.info('Clicking on the filter pattern button');
    await discoverPage.clickFilterPatternButton();
    logger.info('Asserting visibility of the chart, canvas, and data grid row');
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  }, 'Navigating to the "Patterns" tab and asserting patterns row visibility');
  (testInfo as any).stepData = stepData;
});