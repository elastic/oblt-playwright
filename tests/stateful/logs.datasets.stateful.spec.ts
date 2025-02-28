import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { spaceSelectorStateful } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let resultsContainer: string[] = [`\nTest results:`];

test.beforeEach(async ({ headerBar, page, sideNav, spaceSelector }) => {
  await sideNav.goto();
  logger.info('Selecting the default Kibana space');
  await spaceSelectorStateful(headerBar, spaceSelector);
  logger.info ('Navigating to the "Data Quality" page');
  await page.goto('/app/management/data/data_quality');
});

test.afterEach('Log test results', async ({}, testInfo) => {
  if (test.info().status == 'passed') {
    logger.info(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
    resultsContainer.push(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
  } else if (test.info().status == 'failed') {
    logger.error(`Test "${testInfo.title}" failed`);
    resultsContainer.push(`Test "${testInfo.title}" failed`);
  }
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

test('Data Set Quality', async ({ datasetsPage }) => { 
    await test.step('pageContentLoading', async () => {
        logger.info('Checking the visibility of quality statistics');
        await datasetsPage.assertVisibilityQualityStatistics();
        logger.info('Checking the visibility of statistics');
        await datasetsPage.assertVisibilityStatistics();
        logger.info('Checking the visibility of the table');
        await datasetsPage.assertVisibilityTable();
    });
});