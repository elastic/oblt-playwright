import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { fetchClusterData, spaceSelectorStateful, testStep, writeJsonReport } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Fetch cluster data', async ({}) => {
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ headerBar, page, sideNav, spaceSelector }) => {
  await sideNav.goto();
  logger.info('Selecting the default Kibana space');
  await spaceSelectorStateful(headerBar, spaceSelector);
  logger.info ('Navigating to the "Data Quality" page');
  await page.goto('/app/management/data/data_quality');
});

test.afterEach('Log test results', async ({}, testInfo) => {
  const stepData = (testInfo as any).stepData;
  await writeJsonReport(clusterData, testInfo, testStartTime, stepData);
});

test('Data Set Quality', async ({ datasetsPage, page }, testInfo) => {
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info('Checking the visibility of quality statistics');
    await datasetsPage.assertVisibilityQualityStatistics();
    logger.info('Checking the visibility of statistics');
    await datasetsPage.assertVisibilityStatistics();
    logger.info('Checking the visibility of the table');
    await datasetsPage.assertVisibilityTable();
    });
  (testInfo as any).stepData = stepData;
});