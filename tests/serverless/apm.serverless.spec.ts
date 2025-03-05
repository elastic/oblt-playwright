import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { checkApmData, fetchClusterData, spaceSelectorServerless, writeJsonReport } from '../../src/helpers.ts';
import { logger } from '../../src/logger.ts';

let resultsContainer: string[] = [`\nTest results:`];
let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Check APM data', async ({ request }) => {
  logger.info('Checking if APM data is available');
  const hasData = await checkApmData(request);
  test.skip(!hasData == true, 'Test is skipped: No APM data is available');
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ sideNav, spaceSelector }) => {
  await sideNav.goto();
  logger.info('Selecting the default Kibana space')
  await spaceSelectorServerless(sideNav, spaceSelector);
  logger.info('Navigating to the "APM" section');
  await sideNav.clickApplications();
});

test.afterEach('Log test results', async ({}, testInfo) => {
  if (test.info().status == 'passed') {
    logger.info(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
    resultsContainer.push(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
  } else if (test.info().status == 'failed') {
    logger.error(`Test "${testInfo.title}" failed`);
    resultsContainer.push(`Test "${testInfo.title}" failed`);
  }

  const stepsData = (testInfo as any).stepsData;
  await writeJsonReport(clusterData, testInfo, testStartTime, stepsData);
});

test.afterAll('Log test suite summary', async ({}, testInfo) => {
  if (testInfo.status == 'skipped') {
      resultsContainer.push(`Test "${testInfo.title}" skipped`);
      }
  resultsContainer.forEach((result) => {
    console.log(`${result}\n`);
  });
});

test('APM - Services', async ({ datePicker, sideNav, discoverPage, notifications, servicesPage }, testInfo) => {
  const throughput: string = "throughput";
  const errorRate: string = "errorRate";
  let steps: object[] = [];

  await test.step('step01', async () => {
    const stepStartTime = performance.now();
    
    logger.info('Navigating to the "Services" section');
    await sideNav.clickServices();
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and selecting the "opbeans-go" service`);
    await datePicker.setPeriod();
    await servicesPage.selectServiceOpbeansGo();
    logger.info('Asserting visibility of the "Transactions" tab');
    await Promise.race([
      servicesPage.assertVisibilityTransactionsTab(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step01": stepDuration});
  });
  
  await test.step('step02', async () => {
    const stepStartTime = performance.now();

    logger.info('Navigating to the "Transactions" tab and asserting visibility of the "Throughput" visualization');
    await servicesPage.openTransactionsTab();
    await servicesPage.assertVisibilityVisualization(throughput);
    await servicesPage.selectMostImpactfulTransaction();
    logger.info('Asserting visibility of the "Error rate" visualization');
    await Promise.race([
      servicesPage.assertVisibilityVisualization(errorRate),
      servicesPage.assertTransactionErrorsNotFound().then(() => {
        throw new Error('Test is failed because transaction errors not found');
      })
    ]);

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step02": stepDuration});
  });
  
  await test.step('step03', async () => {
    const stepStartTime = performance.now();

    logger.info('Clicking on the "Failed transaction correlations" tab');
    await servicesPage.openFailedTransactionCorrelationsTab();
    logger.info('Asserting visibility of the "Correlation" button');
    await servicesPage.assertVisibilityCorrelationButton();
    logger.info('Filtering data by correlation value and field value');
    await servicesPage.filterByFieldValue();
    await servicesPage.filterByCorrelationValue();

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step03": stepDuration});
  });
  
  await test.step('step04', async () => {
    const stepStartTime = performance.now();

    logger.info('Clicking on the "Investigate" button and navigating to Discover');
    await servicesPage.clickInvestigate();
    await servicesPage.clickViewInDiscoverButton();
    logger.info('Asserting visibility of the canvas');
    await discoverPage.assertVisibilityCanvas();

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step04": stepDuration});
  });
  (testInfo as any).stepsData = steps;
});

test('APM - Traces', async ({ datePicker, headerBar, sideNav, notifications, servicesPage, tracesPage }, testInfo) => {
  let steps: object[] = [];

  await test.step('step01', async () => {
    const stepStartTime = performance.now();
    
    logger.info('Navigating to the "Traces" section');
    await sideNav.clickTraces();
    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and waiting for the top traces table to be loaded`);
    await datePicker.setPeriod();
    await Promise.race([
      headerBar.assertLoadingIndicator(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step01": stepDuration});
  });
  
  await test.step('step02', async () => {
    const stepStartTime = performance.now();

    logger.info('Opening the "Explorer" tab and filtering data by http.response.status_code : 502');
    await tracesPage.openExplorerTab();
    await tracesPage.filterBy('service.name : "opbeans-go" and http.response.status_code : 502');

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step02": stepDuration});
  });
  
  await test.step('step03', async () => {
    const stepStartTime = performance.now();

    logger.info('Clicking on the "View related error" in the timeline and asserting related errors');
    await Promise.race([
      tracesPage.assertRelatedError(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);
    logger.info('Clicking on the related error and asserting visibility of the error distribution chart');
    await tracesPage.clickRelatedError();
    await servicesPage.assertVisibilityErrorDistributionChart();

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step03": stepDuration});
  });
  (testInfo as any).stepsData = steps;
});

test('APM - Dependencies', async ({ datePicker, dependenciesPage, sideNav, discoverPage, notifications, headerBar }, testInfo) => {
  let steps: object[] = [];

  await test.step('step01', async () => {
    const stepStartTime = performance.now();

    logger.info('Navigating to the "Dependencies" section and asserting visibility of dependencies table');
    await sideNav.clickDependencies();
    await dependenciesPage.assertVisibilityTable();

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step01": stepDuration});
  });

  await test.step('step02', async () => {
    const stepStartTime = performance.now();

    logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT} and asserting visibility of dependencies table`);
    await datePicker.setPeriod();
    await Promise.race([
      headerBar.assertLoadingIndicator(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);
    logger.info('Clicking on the dependency and asserting visibility of dependencies table');
    await dependenciesPage.clickTableRow();
    await dependenciesPage.assertVisibilityTable();
    logger.info('Navigating to the Operations tab and asserting visibility of the table');
    await dependenciesPage.openOperationsTab();
    await Promise.race([
      dependenciesPage.assertVisibilityTable(),
      dependenciesPage.assertOperationsNotFound().then(() => {
        throw new Error('Test is failed because dependency operations not found');
      })
    ]);

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step02": stepDuration});
  });

  await test.step('step03', async () => {
    const stepStartTime = performance.now();

    logger.info('Clicking on the most impactful operation and asserting visibility of the timeline');
    await dependenciesPage.clickTableRow();
    await Promise.race([
      dependenciesPage.assertVisibilityTimelineTransaction(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data');
      })
    ]);

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step03": stepDuration});
  });

  await test.step('step04', async () => {
    const stepStartTime = performance.now();

    logger.info('Clicking on the transaction in the timeline and asserting visibility of the tab panel');
    await dependenciesPage.clickTimelineTransaction();
    await dependenciesPage.assertVisibilityTabPanel();

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step04": stepDuration});
  });

  await test.step('step05', async () => {
    const stepStartTime = performance.now();

    logger.info('Clicking on the "Investigate" button and navigating to Trace logs');
    await dependenciesPage.clickInvestigateButton();
    await dependenciesPage.clickTraceLogsButton();
    logger.info('Asserting visibility of the data grid row');
    await discoverPage.assertVisibilityDataGridRow();

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step05": stepDuration});
  });
  (testInfo as any).stepsData = steps;
});
