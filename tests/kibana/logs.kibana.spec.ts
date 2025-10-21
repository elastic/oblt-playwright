import { test } from '../../src/pom/page.fixtures.ts';
import { 
  fetchClusterData, 
  getDatePickerLogMessage,
  getDocCount,
  printResults, 
  selectDefaultSpace, 
  testStep, 
  writeJsonReport 
} from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let clusterData: any;
let doc_count: object;
let reports: string[] = [];
const testStartTime: string = new Date().toISOString();

test.beforeAll('Fetch cluster data', async ({}) => {
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
  doc_count = await getDocCount();
});

test.beforeEach(async ({ discoverPage, page, sideNav, spaceSelector }) => {
  logger.info('Selecting the default Kibana space');
  await sideNav.goto();
  await selectDefaultSpace(clusterData.version.build_flavor, page);
  logger.info('Navigating to the "Discover" section');
  await page.goto('/app/discover');
  logger.info('Selecting the "Logs" data view');
  await discoverPage.selectLogsDataView();
});

test.afterEach('Log test results', async ({}, testInfo) => {
  const stepData = (testInfo as any).stepData;
  const reportFiles = await writeJsonReport(clusterData, testInfo, testStartTime, doc_count, stepData);
  reports.push(...reportFiles.filter(item => typeof item === 'string'));
});

test.afterAll('Print test results', async ({}) => {
  await printResults(reports);
});

test.skip('Discover - All logs', async ({datePicker, discoverPage, headerBar, notifications, page}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessage()}, asserting visibility of the chart, canvas, and data grid row`);
    await datePicker.setInterval();
    await headerBar.assertVisibleLoadingIndicator();
    await Promise.race([
      Promise.all([
        discoverPage.assertVisibilityCanvas(),
        discoverPage.assertVisibilityDataGridRow(),
        headerBar.assertLoadingIndicator()
      ]),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      }),
      notifications.assertErrorIncrementCount().then(() => {
        throw new Error(`Test is failed: Error loading data in index logs-*. already closed, can't increment ref count`);
      }),
      discoverPage.assertHistogramEmbeddedError().then(() => {
        throw new Error('Test is failed: Chart failed to load');
      }),
      discoverPage.assertAbortedExpression().then(() => {
        throw new Error('Test is failed: Chart failed to load');
      })
    ]);
  }, 'Selecting "*logs" data view, setting search interval and asserting canvas visibility');
  (testInfo as any).stepData = stepData;
});

test('Discover - Field Statistics', async ({datePicker, discoverPage, headerBar, notifications, page}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessage()}, asserting visibility of the chart, canvas, and data grid row`);
    await datePicker.setInterval();
    await headerBar.assertVisibleLoadingIndicator();
    await Promise.race([
      Promise.all([
        await discoverPage.assertVisibilityCanvas(),
        await discoverPage.assertVisibilityDataGridRow(),
        headerBar.assertLoadingIndicator()
      ]),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      }),
      notifications.assertErrorIncrementCount().then(() => {
        throw new Error(`Test is failed: Error loading data in index logs-*. already closed, can't increment ref count`);
      }),
      discoverPage.assertHistogramEmbeddedError().then(() => {
        throw new Error('Test is failed: Chart failed to load');
      }),
      discoverPage.assertAbortedExpression().then(() => {
        throw new Error('Test is failed: Chart failed to load');
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
      }),
      discoverPage.assertHistogramEmbeddedError().then(() => {
        throw new Error('Test is failed: Chart failed to load');
      }),
      discoverPage.assertAbortedExpression().then(() => {
        throw new Error('Test is failed: Chart failed to load');
      })
    ]);
  }, 'Navigating to the "Field Statistics" tab and asserting doc count');
  (testInfo as any).stepData = stepData;
});

test('Discover - Patterns', async ({datePicker, discoverPage, headerBar, notifications, page}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessage()}, asserting visibility of the chart, canvas, and data grid row`);
    await datePicker.setInterval();
    await headerBar.assertVisibleLoadingIndicator();
    await Promise.race([
      Promise.all([
        await discoverPage.assertVisibilityCanvas(),
        await discoverPage.assertVisibilityDataGridRow(),
        headerBar.assertLoadingIndicator()
      ]),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      }),
      notifications.assertErrorIncrementCount().then(() => {
        throw new Error(`Test is failed: Error loading data in index logs-*. already closed, can't increment ref count`);
      }),
      discoverPage.assertHistogramEmbeddedError().then(() => {
        throw new Error('Test is failed: Chart failed to load');
      }),
      discoverPage.assertAbortedExpression().then(() => {
        throw new Error('Test is failed: Chart failed to load');
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
      }),
      discoverPage.assertHistogramEmbeddedError().then(() => {
        throw new Error('Test is failed: Chart failed to load');
      }),
      discoverPage.assertAbortedExpression().then(() => {
        throw new Error('Test is failed: Chart failed to load');
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