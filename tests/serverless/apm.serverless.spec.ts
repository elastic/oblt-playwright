import {test} from '../../tests/fixtures/serverless/basePage';

test.beforeEach(async ({ landingPage }) => {
  await landingPage.goto();
  await landingPage.clickApplications();
});

test('APM - Services', async ({ datePicker, landingPage, logsExplorerPage, page, servicesPage }) => {
  const throughput = "throughput";

  // Step 01 - Navigates to Observability > APM > Services. Selects opbeans-go.
  await test.step('step01', async () => {
    await landingPage.clickServices();
    await servicesPage.selectServiceOpbeansGo();
    await page.waitForLoadState('networkidle');
  });
  
  // Step 02 - Filters data by selected date picker option.
  await test.step('step02', async () => {
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
  });
  
  // Step 03 - Opens the "Transactions" tab. Clicks on the most impactful transaction.
  await test.step('step03', async () => {
    await servicesPage.openTransactionsTab();
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await servicesPage.assertVisibilityVisualization(throughput);
    await servicesPage.selectMostImpactfulTransaction();
    await servicesPage.assertVisibilityVisualization(throughput);
  });
  
  // Step 04 - Clicks on the "Failed transaction correlations" tab. Filters the result by a particular field value.
  await test.step('step04', async () => {
    await servicesPage.openFailedTransactionCorrelationsTab();
    await page.waitForLoadState('networkidle');
    await servicesPage.assertVisibilityCorrelationButton();
    await servicesPage.filterByFieldValue();
    await servicesPage.filterByCorrelationValue();
    await page.waitForLoadState('networkidle');
  });
  
  // Step 05 - Clicks on "Investigate", navigates to "Host logs".
  await test.step('step05', async () => {
    await servicesPage.clickInvestigate();
    await servicesPage.clickHostLogsButton();
    await logsExplorerPage.assertVisibilityCanvas();
  });
  
  // Step 06 - Filters logs by selected date picker option, then filters by error messages. Expands certain document.
  await test.step('step06', async () => {
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
    await logsExplorerPage.filterLogsByError();
    await page.waitForLoadState('networkidle');
    await logsExplorerPage.expandLogsDataGridRow();
    await page.waitForLoadState('networkidle');
  });
});

test('APM - Traces', async ({ datePicker, landingPage, page, servicesPage, tracesPage }) => {
  // Step 01 - Navigates to Observability > APM > Traces.
  await test.step('step01', async () => {
    await landingPage.clickTraces();
    await page.waitForLoadState('networkidle');
  });
  
  // Step 02 - Opens the "Explorer" tab, filters data by http.response.status_code : 502.
  await test.step('step02', async () => {
    await tracesPage.openExplorerTab();
    await page.waitForLoadState('networkidle');
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
    await tracesPage.filterBy('http.response.status_code : 502');
    await page.waitForLoadState('networkidle');
  });
  
  // Step 03 - Clicks on the "View related error" in the timeline.
  await test.step('step03', async () => {
    await tracesPage.clickRelatedError();
    await servicesPage.assertVisibilityErrorDistributionChart();
  });
});

test('APM - Dependencies', async ({ datePicker, dependenciesPage, landingPage, logsExplorerPage, page }) => {
  // Step 01 - Navigates to Observability > APM > Dependencies.
  await test.step('step01', async () => {
    await landingPage.clickDependencies();
    await dependenciesPage.assertVisibilityTable();
  });

  // Step 02 - Filters data by selected date picker option.
  await test.step('step02', async () => {
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
  });

  // Step 03 - Selects the dependency, then navigates to the "Operations" tab.
  await test.step('step03', async () => {
    await dependenciesPage.clickTableRow();
    await dependenciesPage.assertVisibilityTable();
    await dependenciesPage.openOperationsTab();
    await dependenciesPage.assertVisibilityTable();
  });

  // Step 04 - Clicks on the most impactful operation.
  await test.step('step04', async () => {
    await dependenciesPage.clickTableRow();
    await dependenciesPage.assertVisibilityTimelineTransaction();
  });

  // Step 05 - Clicks on the transaction in the timeline to open the detailed view.
  await test.step('step05', async () => {
    await dependenciesPage.clickTimelineTransaction();
    await dependenciesPage.assertVisibilityTabPanel();
  });

  // Step 06 - Clicks on "Investigate", selects "Trace logs".
  await test.step('step06', async () => {
    await dependenciesPage.clickInvestigateButton();
    await dependenciesPage.clickTraceLogsButton();
    await logsExplorerPage.assertVisibilityDataGridRow();
  });
});