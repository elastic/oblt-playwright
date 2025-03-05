import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { checkApmData, spaceSelectorStateful, waitForOneOf } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let resultsContainer: string[] = [`\nTest results:`];

test.beforeAll('Check APM data', async ({ request }) => {
  logger.info('Checking if APM data is available');
  const hasData = await checkApmData(request);
  test.skip(!hasData == true, 'Test is skipped: No APM data is available');
});

test.beforeEach(async ({ headerBar, sideNav, spaceSelector }) => {
  await sideNav.goto();
  logger.info('Selecting the default Kibana space');
  await spaceSelectorStateful(headerBar, spaceSelector);
  logger.info('Navigating to the Observability section');
  await sideNav.clickObservabilitySolutionLink();
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

test('APM - Services', async ({ datePicker, discoverPage, notifications, observabilityPage, servicesPage }, testInfo) => {
  const throughput = "throughput";
  const errorRate = "errorRate";

  await test.step('step01', async () => {
    logger.info('Navigating to the "Services" section');
    await observabilityPage.clickServices();
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and selecting the "opbeans-go" service`);
    await datePicker.setPeriod();
    await servicesPage.selectServiceOpbeansGo();
    logger.info('Asserting visibility of the "Transactions" tab');
    await Promise.race([
      servicesPage.assertVisibilityTransactionsTab(),
      notifications.assertErrorFetchingResource().then(() => {
        logger.error('Test is failed due to an error when loading data');
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);
  });
  
  await test.step('step02', async () => {
    logger.info('Navigating to the "Transactions" tab and asserting visibility of the "Throughput" visualization');
    await servicesPage.openTransactionsTab();
    await servicesPage.assertVisibilityVisualization(throughput);
    logger.info('Selecting the most impactful transaction and asserting visibility of the "Error rate" visualization');
    await servicesPage.selectMostImpactfulTransaction();
    await Promise.race([
      servicesPage.assertVisibilityVisualization(errorRate),
      servicesPage.assertTransactionErrorsNotFound().then(() => {
        logger.error('Test is failed because transaction errors not found');
        throw new Error('Test is failed because transaction errors not found');
      })
    ]);
  });
  
  await test.step('step03', async () => {
    logger.info('Navigating to the "Failed transaction correlations" tab');
    await servicesPage.openFailedTransactionCorrelationsTab();
    logger.info('Asserting visibility of the "Correlation" button');
    await servicesPage.assertVisibilityCorrelationButton();
    logger.info('Filtering data by field value and correlation value');
    await servicesPage.filterByFieldValue();
    await servicesPage.filterByCorrelationValue();
  });
  
  await test.step('step04', async () => {
    logger.info('Clicking on the "Investigate" button and navigating to Discover');
    await servicesPage.clickInvestigate();
    await servicesPage.clickViewInDiscoverButton();
    logger.info('Asserting visibility of the canvas');
    await discoverPage.assertVisibilityCanvas();
  });
});

test('APM - Traces', async ({ datePicker, notifications, observabilityPage, servicesPage, tracesPage }, testInfo) => {
  await test.step('step01', async () => {
    logger.info('Navigating to the "Traces" section');
    await observabilityPage.clickTraces();
  });
  
  await test.step('step02', async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and filtering data by http.response.status_code : 502`);
    await tracesPage.openExplorerTab();
    await datePicker.setPeriod();
    await tracesPage.filterBy('service.name : "opbeans-go" and http.response.status_code : 502');
  });
  
  await test.step('step03', async () => {
    logger.info('Clicking on the "View related error" in the timeline and asserting related errors');
    await Promise.race([
      tracesPage.assertRelatedError(),
      notifications.assertErrorFetchingResource().then(() => {
        logger.error('Test is failed due to an error when loading data');
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);
    logger.info('Clicking on the related error and asserting visibility of the error distribution chart');
    await tracesPage.clickRelatedError();
    await servicesPage.assertVisibilityErrorDistributionChart();
  });
});

test('APM - Dependencies', async ({ datePicker, dependenciesPage, discoverPage, notifications, observabilityPage }, testInfo) => {  
  await test.step('step01', async () => {
    logger.info('Navigating to the "Dependencies" section and asserting visibility of dependencies table');
    await observabilityPage.clickDependencies();
    await dependenciesPage.assertVisibilityTable();
  });

  await test.step('step02', async () => {
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and asserting visibility of dependencies table`);
    await datePicker.setPeriod();
    const [ index ] = await waitForOneOf([
      dependenciesPage.dependencyTableLoaded(),
      dependenciesPage.dependencyTableNotLoaded()
      ]);
    const tableLoaded = index === 0;
    if (tableLoaded) {
      logger.info('Clicking on the dependency and asserting visibility of dependencies table');
      await dependenciesPage.clickTableRow();
      await dependenciesPage.assertVisibilityTable();
      logger.info('Navigating to the Operations tab and asserting visibility of the table');
      await dependenciesPage.openOperationsTab();
      await Promise.race([
        dependenciesPage.assertVisibilityTable(),
        dependenciesPage.assertOperationsNotFound().then(() => {
          logger.error('Test is failed because dependency operations not found');
          throw new Error('Test is failed because dependency operations not found');
        })
      ]);
    } else {
      logger.error('Dependencies table not loaded.');
      throw new Error('Test is failed due to an error when loading dependencies table.');
    }
  });

  await test.step('step03', async () => {
    logger.info('Clicking on the most impactful operation and asserting visibility of the timeline');
    await dependenciesPage.clickTableRow();
    await Promise.race([
      dependenciesPage.assertVisibilityTimelineTransaction(),
      notifications.assertErrorFetchingResource().then(() => {
        logger.error('Test is failed due to an error when loading data');
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);
  });

  await test.step('step04', async () => {
    logger.info('Clicking on the transaction in the timeline and asserting visibility of the tab panel');
    await dependenciesPage.clickTimelineTransaction();
    await dependenciesPage.assertVisibilityTabPanel();
  });

  await test.step('step05', async () => {
    logger.info('Clicking on the "Investigate" button and selecting "View transaction in Discover"');
    await dependenciesPage.clickInvestigateButton();
    await dependenciesPage.clickViewInDiscover();
    logger.info('Asserting visibility of the data grid row');
    await discoverPage.assertVisibilityDataGridRow();
  });
});