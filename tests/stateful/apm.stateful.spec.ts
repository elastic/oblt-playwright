import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { checkApmData, fetchClusterData, spaceSelectorStateful, waitForOneOf, testStep, writeJsonReport, getCacheStats } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Check APM data', async ({ request }) => {
  logger.info('Checking if APM data is available');
  const hasData = await checkApmData(request);
  test.skip(!hasData == true, 'Test is skipped: No APM data is available');
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ headerBar, sideNav, spaceSelector }) => {
  await sideNav.goto();
  logger.info('Selecting the default Kibana space');
  await spaceSelectorStateful(headerBar, spaceSelector);
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

test('APM - Services', async ({ datePicker, discoverPage, notifications, page, servicesPage }, testInfo) => {
  const throughput = "throughput";
  const errorRate = "errorRate";
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info('Navigating to the "Services" section');
    await page.goto('/app/apm/services');
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

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);
  
  await testStep('step02', stepData, page, async () => {
    logger.info('Navigating to the "Transactions" tab and asserting visibility of the "Throughput" visualization');
    await servicesPage.openTransactionsTab();
    await servicesPage.assertVisibilityVisualization(throughput);
    logger.info('Selecting the most impactful transaction and asserting visibility of the "Error rate" visualization');
    await servicesPage.selectMostImpactfulTransaction();
    await Promise.race([
      servicesPage.assertVisibilityVisualization(errorRate),
      servicesPage.assertTransactionErrorsNotFound().then(() => {
        throw new Error('Test is failed because transaction errors not found');
      })
    ]);
  });

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);
  
  await testStep('step03', stepData, page, async () => {
    logger.info('Clicking on the "Failed transaction correlations" tab');
    await servicesPage.openFailedTransactionCorrelationsTab();
    logger.info('Asserting visibility of the "Correlation" button');
    await servicesPage.assertVisibilityCorrelationButton();
    logger.info('Filtering data by field value and correlation value');
    await servicesPage.filterByFieldValue();
    await servicesPage.filterByCorrelationValue();
  });

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);
  
  await testStep('step04', stepData, page, async () => {
    logger.info('Clicking on the "Investigate" button and navigating to Discover');
    await servicesPage.clickInvestigate();
    await servicesPage.clickViewInDiscoverButton();
    logger.info('Asserting visibility of the canvas');
    await discoverPage.assertVisibilityCanvas();
  });
  (testInfo as any).stepData = stepData;
});

test('APM - Traces', async ({ datePicker, headerBar, notifications, page, servicesPage, tracesPage }, testInfo) => {
  let stepData: object[] = [];
  
  await testStep('step01', stepData, page, async () => {
    logger.info('Navigating to the "Traces" section');
    await page.goto('/app/apm/traces');
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and filtering data by http.response.status_code : 502`);
    await datePicker.setPeriod();
    await Promise.race([
      headerBar.assertLoadingIndicator(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);
  });

  logger.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step02', stepData, page, async () => {
    logger.info('Opening the "Explorer" tab and filtering data by http.response.status_code : 502');
    await tracesPage.openExplorerTab();
    await tracesPage.filterBy('service.name : "opbeans-go" and http.response.status_code : 502');
  });

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);
  
  await testStep('step03', stepData, page, async () => {
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
  (testInfo as any).stepData = stepData;
});

test('APM - Dependencies', async ({ datePicker, dependenciesPage, discoverPage, notifications, page }, testInfo) => {  
  let stepData: object[] = [];
  
  await testStep('step01', stepData, page, async () => {
    logger.info('Navigating to the "Dependencies" section and asserting visibility of dependencies table');
    await page.goto('/app/apm/dependencies');
    await dependenciesPage.assertVisibilityTable();
  });

  logger.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step02', stepData, page, async () => {
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

  logger.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step03', stepData, page, async () => {
    logger.info('Clicking on the most impactful operation and asserting visibility of the timeline');
    // Selecting the first row in the table since the list of dependencies changes on each refresh
    await dependenciesPage.clickTableRow();
    await Promise.race([
      dependenciesPage.assertVisibilityTimelineTransaction(),
      notifications.assertErrorFetchingResource().then(() => {
        logger.error('Test is failed due to an error when loading data');
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);
  });

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step04', stepData, page, async () => {
    logger.info('Clicking on the transaction in the timeline and asserting visibility of the tab panel');
    await dependenciesPage.clickTimelineTransaction();
    await dependenciesPage.assertVisibilityTabPanel();
  });

  logger.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step05', stepData, page, async () => {
    logger.info('Clicking on the "Investigate" button and selecting "View transaction in Discover"');
    await dependenciesPage.clickInvestigateButton();
    await dependenciesPage.clickViewInDiscover();
    logger.info('Asserting visibility of the data grid row');
    await discoverPage.assertVisibilityDataGridRow();
  });
  (testInfo as any).stepData = stepData;
});