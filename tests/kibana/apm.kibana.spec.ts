import { test } from '../../src/pom/page-fixtures.ts';
import { selectDefaultSpace, testStep, getDatePickerLogMessage } from '../../src/helpers/test-utils.ts';
import { checkApmData, fetchClusterData, getDocCount } from '../../src/helpers/api-client.ts';
import { writeJsonReport, printResults } from '../../src/helpers/reporter.ts';

let clusterData: any;
let doc_count: object;
let reports: string[] = [];
const testStartTime: string = new Date().toISOString();

test.beforeAll('Check APM data', async ({ request, log }) => {
  log.info('Checking if APM data is available');
  const hasData = await checkApmData(request);
  test.skip(!hasData == true, 'Test is skipped: No APM data is available');
  log.info('Fetching cluster data');
  clusterData = await fetchClusterData();
  doc_count = await getDocCount();
});

test.beforeEach(async ({ page, sideNav, log }) => {
  await sideNav.goto();
  log.info('Selecting the default Kibana space');
  await selectDefaultSpace(clusterData.version.build_flavor, page);
});

test.afterEach('Log test results', async ({ log }, testInfo) => {
  const stepData = (testInfo as any).stepData;
  const reportFiles = await writeJsonReport(log, clusterData, testInfo, testStartTime, doc_count, stepData);
  reports.push(...reportFiles.filter(item => typeof item === 'string'));
});

test.afterAll('Print test results', async ({ }) => {
  await printResults(reports);
});

test('APM - Services', async ({ datePicker, discoverPage, notifications, page, servicesPage, log }, testInfo) => {
  const throughput: string = "throughput";
  const errorRate: string = "errorRate";
  let stepData: object[] = [];
  (testInfo as any).stepData = stepData;

  await testStep('step01', stepData, page, async () => {
    log.info('Navigating to the "Services" section');
    await page.goto('/app/apm/services');
    log.info(`${getDatePickerLogMessage()} and selecting the "opbeans-go" service`);
    await datePicker.setInterval();
    await Promise.race([
      servicesPage.selectServiceOpbeansGo(),
      servicesPage.assertServicesNotFound().then(() => {
        throw new Error('Test is failed because services not found');
      }),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      })
    ]);
    log.info('Asserting visibility of the "Transactions" tab');
    await Promise.race([
      servicesPage.assertVisibilityTransactionsTab(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      })
    ]);
  }, 'Setting search interval, then selecting "opbeans-go" and asserting transaction tab visibility');

  log.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step02', stepData, page, async () => {
    log.info('Navigating to the "Transactions" tab and asserting visibility of the "Throughput" visualization');
    await servicesPage.openTransactionsTab();
    await servicesPage.assertVisibilityVisualization(throughput);
    log.info('Selecting the most impactful transaction and asserting visibility of the "Error rate" visualization');
    await servicesPage.selectMostImpactfulTransaction();
    await Promise.race([
      servicesPage.assertVisibilityVisualization(errorRate),
      servicesPage.assertTransactionErrorsNotFound().then(() => {
        throw new Error('Test is failed because transaction errors not found');
      })
    ]);
  }, 'Navigating to the "Transactions" tab, clicking on the most impactful transaction and asserting visualization visibility');

  log.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step03', stepData, page, async () => {
    log.info('Clicking on the "Failed transaction correlations" tab');
    await servicesPage.openFailedTransactionCorrelationsTab();
    log.info('Asserting visibility of the "Correlation" button');
    await Promise.race([
      servicesPage.assertVisibilityCorrelationButton(),
      servicesPage.assertNoSignificantCorrelations().then(() => {
        log.warn('Time range is too narrow: No significant APM transaction correlations found');
        test.skip(true, 'Time range is too narrow: No significant APM transaction correlations found');
      })
    ]);
    log.info('Filtering data by correlation value and field value');
    await servicesPage.filterByFieldValue();
    await servicesPage.filterByCorrelationValue();
  }, 'Clicking on the "Failed transaction correlations" tab, asserting visualization visibility, then filtering the result by a certain field value');

  log.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step04', stepData, page, async () => {
    log.info('Clicking on the "Investigate" button and navigating to Discover');
    await servicesPage.clickInvestigate();
    await servicesPage.clickTraceLogsButton();
    log.info('Asserting visibility of the canvas');
    await discoverPage.assertVisibilityCanvas();
  }, 'Clicking on the "Investigate" button, navigating to Discover, and asserting canvas visibility');
});

// Test is skipped because Explorer section is not currently available
test.skip('APM - Traces', async ({ datePicker, headerBar, notifications, page, servicesPage, tracesPage, log }, testInfo) => {
  let stepData: object[] = [];
  (testInfo as any).stepData = stepData;

  await testStep('step01', stepData, page, async () => {
    log.info('Navigating to the "Traces" section');
    await page.goto('/app/apm/traces');
    log.info(`${getDatePickerLogMessage()} and waiting for the top traces table to be loaded`);
    await datePicker.setInterval();
    await Promise.race([
      headerBar.assertLoadingIndicator(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      })
    ]);
  }, 'Setting search interval and waiting for top traces table to load');

  log.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step02', stepData, page, async () => {
    log.info('Opening the "Explorer" tab and filtering data by http.response.status_code : 502');
    await tracesPage.openExplorerTab();
    await tracesPage.filterBy('service.name : "opbeans-go" and http.response.status_code : 502');
  }, 'Navigating to the "Explorer" tab, filtering data by http.response.status_code : 502');

  log.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step03', stepData, page, async () => {
    log.info('Clicking on the "View related error" in the timeline and asserting related errors');
    await Promise.race([
      tracesPage.assertRelatedError(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      })
    ]);
    log.info('Clicking on the related error and asserting visibility of the error distribution chart');
    await tracesPage.clickRelatedError();
    await servicesPage.assertVisibilityErrorDistributionChart();
  }, 'Clicking on the "View related error" in the timeline. Asserting related errors');
});

// Test is skipped due to intermittent functional issues
test.skip('APM - Dependencies', async ({ datePicker, dependenciesPage, discoverPage, notifications, page, headerBar, log }, testInfo) => {
  let stepData: object[] = [];
  (testInfo as any).stepData = stepData;

  await testStep('step01', stepData, page, async () => {
    log.info('Navigating to the "Dependencies" section and asserting visibility of dependencies table');
    await page.goto('/app/apm/dependencies');
    await dependenciesPage.assertVisibilityTable();
  }, 'Navigating to the Dependencies section, asserting dependencies table');

  log.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step02', stepData, page, async () => {
    log.info(`${getDatePickerLogMessage()} and asserting visibility of dependencies table`);
    await datePicker.setInterval();
    await Promise.race([
      headerBar.assertLoadingIndicator(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      })
    ]);
    log.info('Clicking on the dependency and asserting visibility of dependencies table');
    // Selecting the first row in the table since the list of dependencies changes on each refresh
    await dependenciesPage.clickTableRow();
    await dependenciesPage.assertVisibilityTable();
    log.info('Navigating to the Operations tab and asserting visibility of the table');
    await dependenciesPage.openOperationsTab();
    await Promise.race([
      dependenciesPage.assertVisibilityTable(),
      dependenciesPage.assertOperationsNotFound().then(() => {
        throw new Error('Test is failed because dependency operations not found');
      }),
      dependenciesPage.assertUnableToLoadPage().then(() => {
        throw new Error('Test is failed: "Unable to load page" message encountered');
      })
    ]);
  }, 'Setting search interval, selecting the dependency, navigating to the "Operations" tab and asserting table visibility');

  log.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step03', stepData, page, async () => {
    log.info('Clicking on the most impactful operation and asserting visibility of the timeline');
    await dependenciesPage.clickTableRow();
    await Promise.race([
      dependenciesPage.assertVisibilityTimelineTransaction(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed: Error while fetching resource');
      }),
      dependenciesPage.assertUnableToLoadPage().then(() => {
        throw new Error('Test is failed: "Unable to load page" message encountered');
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Test is failed: Trace sample not loaded within 2 minutes')), 120000))
    ]);
  }, 'Clicking on the most impactful operation and asserting timeline visibility');

  log.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step04', stepData, page, async () => {
    log.info('Clicking on the transaction in the timeline and asserting visibility of the tab panel');
    await dependenciesPage.clickTimelineTransaction();
    await dependenciesPage.assertVisibilityTabPanel();
  }, 'Clicking on the transaction in the timeline and asserting tab panel visibility');

  log.info('Waiting for 30s before proceeding to the next step...');
  await page.waitForTimeout(30000);

  await testStep('step05', stepData, page, async () => {
    log.info('Clicking on the "Investigate" button and navigating to Trace logs');
    await dependenciesPage.clickInvestigateButton();
    await dependenciesPage.clickTraceLogsButton();
    log.info('Asserting visibility of the data grid row');
    await discoverPage.assertVisibilityDataGridRow();
  }, 'Selecting "Trace logs", asserting data grid row');
});
