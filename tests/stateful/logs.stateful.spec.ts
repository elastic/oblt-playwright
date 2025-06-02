import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { getCacheStats, fetchClusterData, spaceSelectorStateful, waitForOneOf, testStep, writeJsonReport } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

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
  const timeValue = process.env.TIME_VALUE ? Number(process.env.TIME_VALUE) : undefined;
  if (timeValue !== undefined && timeValue > 1 && process.env.TIME_UNIT === "Days") {
    cacheStats = await getCacheStats();
  }
  const stepData = (testInfo as any).stepData;
  await writeJsonReport(clusterData, testInfo, testStartTime, stepData, cacheStats);
});

test('Discover - All logs', async ({datePicker, discoverPage, page}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
    await datePicker.setPeriod();
    logger.info('Asserting visibility of the chart, canvas, and data grid row');
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  });
  (testInfo as any).stepData = stepData;
});

test('Discover - Field Statistics', async ({datePicker, discoverPage, page}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
    await datePicker.setPeriod();
    logger.info('Asserting visibility of the chart, canvas, and data grid row')
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  });

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step02', stepData, page, async () => {
    logger.info('Navigating to the "Field Statistics" tab');
    await discoverPage.clickFieldStatsTab();
    logger.info('Asserting visibility of the field statistics document count');
    await discoverPage.assertVisibilityFieldStatsDocCount();
  });
  (testInfo as any).stepData = stepData;
});

test('Discover - Patterns', async ({datePicker, discoverPage, page}, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
    await datePicker.setPeriod();
    logger.info('Asserting visibility of the chart, canvas, and data grid row');
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  });

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step02', stepData, page, async () => {
    logger.info('Navigating to the "Patterns" tab');
    await discoverPage.clickPatternsTab();
    logger.info('Asserting visibility of the patterns row toggle');
    const [ index ] = await waitForOneOf([
      discoverPage.logPatternsRowToggle(),
      discoverPage.patternsNotLoaded()
      ]);
    const patternsLoaded = index === 0;
    if (patternsLoaded) {
      await discoverPage.assertVisibilityPatternsRowToggle();
      await discoverPage.clickFilterPatternButton();
      logger.info('Asserting visibility of the chart, canvas, and data grid row');
      await discoverPage.assertChartIsRendered();
      await discoverPage.assertVisibilityCanvas();
      await discoverPage.assertVisibilityDataGridRow();
      } else {
        logger.error('Test is failed due to an error when loading categories');
        throw new Error('Test is failed due to an error when loading categories');
      }
  });
  (testInfo as any).stepData = stepData;
})