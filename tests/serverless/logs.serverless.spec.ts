import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { fetchClusterData, spaceSelectorServerless, waitForOneOf, testStep, writeJsonReport } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let resultsContainer: string[] = [`\nTest results:`];
let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Fetch cluster data', async ({}) => {
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ discoverPage, sideNav, spaceSelector }) => {
  logger.info('Selecting the default Kibana space');
  await sideNav.goto();
  await spaceSelectorServerless(sideNav, spaceSelector);
  logger.info('Navigating to the "Discover" section');
  await sideNav.clickDiscover();
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
      resultsContainer.push(`Test "${testInfo.title}" skipped`);
      }
  resultsContainer.forEach((result) => {
    console.log(`${result}\n`);
  });
});

test('Discover - All logs', async ({datePicker, discoverPage, headerBar, notifications, page}, testInfo) => {
  let stepDuration: object[] = [];
  let stepStart: object[] = [];
  let stepEnd: object[] = [];

  await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and asserting visibility of the chart, canvas, and data grid row`);
    await datePicker.setPeriod();
    await Promise.race([
      Promise.all([
        discoverPage.assertChartIsRendered(),
        discoverPage.assertVisibilityCanvas(),
        discoverPage.assertVisibilityDataGridRow(),
        headerBar.assertLoadingIndicator()
      ]),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data');
        })
    ]);
  });
  (testInfo as any).stepDuration = stepDuration;
  (testInfo as any).stepStart = stepStart;
  (testInfo as any).stepEnd = stepEnd;
});

test('Discover - Field Statistics', async ({datePicker, discoverPage, headerBar, notifications, page}, testInfo) => {
  let stepDuration: object[] = [];
  let stepStart: object[] = [];
  let stepEnd: object[] = [];

  await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and asserting visibility of the chart, canvas, and data grid row`);
    await datePicker.setPeriod();
    await Promise.race([
      Promise.all([
        await discoverPage.assertChartIsRendered(),
        await discoverPage.assertVisibilityCanvas(),
        await discoverPage.assertVisibilityDataGridRow(),
        headerBar.assertLoadingIndicator()
      ]),
    notifications.assertErrorFetchingResource().then(() => {
      throw new Error('Test is failed due to an error when loading data');
      })
    ]);
  });

  await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
    logger.info('Navigating to the "Field statistics" tab and asserting visibility of the document count');
    await discoverPage.clickFieldStatsTab();
    await Promise.race([
      Promise.all([
        discoverPage.assertVisibilityFieldStatsDocCount(),
        headerBar.assertLoadingIndicator()
      ]),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data');
        })
    ]);
  });
  (testInfo as any).stepDuration = stepDuration;
  (testInfo as any).stepStart = stepStart;
  (testInfo as any).stepEnd = stepEnd;
});

test('Discover - Patterns', async ({datePicker, discoverPage, headerBar, notifications, page}, testInfo) => {
  let stepDuration: object[] = [];
  let stepStart: object[] = [];
  let stepEnd: object[] = [];

  await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and asserting visibility of the chart, canvas, and data grid row`);
    await datePicker.setPeriod();
    await Promise.race([
      Promise.all([
        await discoverPage.assertChartIsRendered(),
        await discoverPage.assertVisibilityCanvas(),
        await discoverPage.assertVisibilityDataGridRow(),
        headerBar.assertLoadingIndicator()
      ]),
    notifications.assertErrorFetchingResource().then(() => {
      throw new Error('Test is failed due to an error when loading data');
      })
    ]);
  });

  await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
    logger.info('Navigating to the "Patterns" tab and asserting visibility of the patterns row toggle');
    await discoverPage.clickPatternsTab();
    const [ index ] = await waitForOneOf([
      discoverPage.logPatternsRowToggle(),
      discoverPage.patternsNotLoaded()
      ]);
    const patternsLoaded = index === 0;
    if (patternsLoaded) {
      await discoverPage.assertVisibilityPatternsRowToggle();
      logger.info('Clicking on the filter pattern button');
      await discoverPage.clickFilterPatternButton();
      logger.info('Asserting visibility of the chart, canvas, and data grid row');
      await discoverPage.assertChartIsRendered();
      await discoverPage.assertVisibilityCanvas();
      await discoverPage.assertVisibilityDataGridRow();
      } else {
        throw new Error('Test is failed due to an error when loading categories');
      }
  });
  (testInfo as any).stepDuration = stepDuration;
  (testInfo as any).stepStart = stepStart;
  (testInfo as any).stepEnd = stepEnd;
});