import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { getDatePickerLogMessageStateful, fetchClusterData, spaceSelectorStateful, testStep, writeJsonReport, getCacheStats } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';
import { TIME_UNIT, TIME_VALUE } from '../../src/env.ts';

let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Fetch cluster data', async ({}) => {
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ discoverPage, headerBar, page, sideNav, spaceSelector }) => {
  await sideNav.goto();
  logger.info('Selecting the default Kibana space');
  await spaceSelectorStateful(headerBar, spaceSelector);
  logger.info ('Navigating to the "Discover" page');
  await page.goto('/app/discover');
  logger.info('Selecting the "Logs" data view');
  await discoverPage.selectLogsDataView();
});

test.afterEach('Log test results', async ({}, testInfo) => {
  let cacheStats: object | undefined = undefined;
  const timeValue = TIME_VALUE ? Number(TIME_VALUE) : undefined;
  if (timeValue !== undefined && timeValue > 1 && TIME_UNIT === "Days") {
    cacheStats = await getCacheStats();
  }
  const stepData = (testInfo as any).stepData;
  await writeJsonReport(clusterData, testInfo, testStartTime, stepData, cacheStats);
});

test('Discover - All logs', async ({datePicker, discoverPage, page, headerBar, notifications}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessageStateful()}, asserting visibility of the chart, canvas, and data grid row`);
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
  });
  (testInfo as any).stepData = stepData;
});

test('Discover - Field Statistics', async ({datePicker, discoverPage, page, headerBar, notifications}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessageStateful()}, asserting visibility of the chart, canvas, and data grid row`);
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
  });

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
  });
  (testInfo as any).stepData = stepData;
});

test('Discover - Patterns', async ({datePicker, discoverPage, page, headerBar, notifications}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessageStateful()}, asserting visibility of the chart, canvas, and data grid row`);
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
  });

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
  });
  (testInfo as any).stepData = stepData;
})