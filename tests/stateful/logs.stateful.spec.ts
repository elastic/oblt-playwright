import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { fetchClusterData, spaceSelectorStateful, waitForOneOf, testStep, writeJsonReport } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let resultsContainer: string[] = [`\nTest results:`];
let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Fetch cluster data', async ({}) => {
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ discoverPage, headerBar, observabilityPage, sideNav, spaceSelector }) => {
  await sideNav.goto();
  logger.info('Selecting the default Kibana space');
  await spaceSelectorStateful(headerBar, spaceSelector);
  logger.info ('Navigating to the "Observability" page');
  await sideNav.clickObservabilitySolutionLink();
  logger.info ('Navigating to the "Discover" page');
  await observabilityPage.clickDiscover();
  logger.info('Selecting the "Logs" data view');
  await discoverPage.selectLogsDataView();
});

test.afterEach('Log test results', async ({}, testInfo) => {
  if (test.info().status == 'passed') {
    logger.info(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
    resultsContainer.push(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
  } else if (test.info().status == 'failed') {
    logger.error(`Test "${testInfo.title}" failed`);
    resultsContainer.push(`Test "${testInfo.title}" failed`);
  }

  const stepDuration = (testInfo as any).stepDuration;
  const stepStart = (testInfo as any).stepStart;
  const stepEnd = (testInfo as any).stepEnd;
  await writeJsonReport(clusterData, testInfo, testStartTime, stepDuration, stepStart, stepEnd);
});

test.afterAll('Log test suite summary', async ({}, testInfo) => {
  if (testInfo.status == 'skipped') {
      logger.warn(`Test "${testInfo.title}" skipped`);
      resultsContainer.push(`Test "${testInfo.title}" skipped`);
      }
  resultsContainer.forEach((result) => {
    console.log(`${result}\n`);
  });
});

test('Logs Explorer - All logs', async ({datePicker, discoverPage, page}, testInfo) => {
  let stepDuration: object[] = [];
  let stepStart: object[] = [];
  let stepEnd: object[] = [];

  await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
    await datePicker.setPeriod();
    logger.info('Asserting visibility of the chart, canvas, and data grid row');
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  });
  (testInfo as any).stepDuration = stepDuration;
  (testInfo as any).stepStart = stepStart;
  (testInfo as any).stepEnd = stepEnd;
});

test('Logs Explorer - Field Statistics', async ({datePicker, discoverPage, page}, testInfo) => {
  let stepDuration: object[] = [];
  let stepStart: object[] = [];
  let stepEnd: object[] = [];

  await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
    await datePicker.setPeriod();
    logger.info('Asserting visibility of the chart, canvas, and data grid row')
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  });

  await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
    logger.info('Navigating to the "Field Statistics" tab');
    await discoverPage.clickFieldStatsTab();
    logger.info('Asserting visibility of the field statistics document count');
    await discoverPage.assertVisibilityFieldStatsDocCount();
  });
  (testInfo as any).stepDuration = stepDuration;
  (testInfo as any).stepStart = stepStart;
  (testInfo as any).stepEnd = stepEnd;
});

test('Logs Explorer - Patterns', async ({datePicker, discoverPage, page}, testInfo) => {
  let stepDuration: object[] = [];
  let stepStart: object[] = [];
  let stepEnd: object[] = [];

  await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
    await datePicker.setPeriod();
    logger.info('Asserting visibility of the chart, canvas, and data grid row');
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  });

  await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
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
  (testInfo as any).stepDuration = stepDuration;
  (testInfo as any).stepStart = stepStart;
  (testInfo as any).stepEnd = stepEnd;
})