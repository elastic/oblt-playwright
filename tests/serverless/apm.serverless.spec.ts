import {test} from '../../tests/fixtures/serverless/basePage';

test.beforeEach(async ({ landingPage }) => {
  await landingPage.goto();
  await landingPage.clickApplications();
});

test('APM - Services', async ({ datePicker, landingPage, logsExplorerPage, page, servicesPage }) => {
  const throughput = "throughput";

  // Navigates to Observability > APM > Services.
  await landingPage.clickServices();
  await servicesPage.selectServiceOpbeansGo();
  await page.waitForLoadState('networkidle');
  
  // Filters data by selected date picker option.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await page.waitForLoadState('networkidle');
  
  // Opens the "Transactions" tab. Clicks on the most impactful transaction.
  await servicesPage.openTransactionsTab();
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await servicesPage.assertVisibilityVisualization(throughput);
  await servicesPage.selectMostImpactfulTransaction();
  await servicesPage.assertVisibilityVisualization(throughput);
  
  // Clicks on the "Failed transaction correlations" tab.
  await servicesPage.openFailedTransactionCorrelationsTab();
  await page.waitForLoadState('networkidle');
  
  // Sorts the result by field value. Filters the result by a particular field value by clicking on the "+".
  await servicesPage.assertVisibilityCorrelationButton();
  await servicesPage.filterByFieldValue();
  await servicesPage.filterByCorrelationValue();
  await page.waitForLoadState('networkidle');
  
  // Clicks on "Investigate", selects "Host logs".
  await servicesPage.clickInvestigate();
  await servicesPage.clickHostLogsButton();
  await page.waitForLoadState('networkidle');
  
  // Filters logs by selected date picker option, then filters by error messages.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await page.waitForLoadState('networkidle');
  await logsExplorerPage.filterLogsByError();
  await page.waitForLoadState('networkidle');
  
  // Expands certain document.
  await logsExplorerPage.expandLogsDataGridRow();
  await page.waitForLoadState('networkidle');
});

test('APM - Traces', async ({ datePicker, landingPage, page, servicesPage, tracesPage }) => {
  // Navigates to Observability > APM > Traces.
  await landingPage.clickTraces();
  await page.waitForLoadState('networkidle');
  
  // Opens the "Explorer" tab, filters data by http.response.status_code : 502.
  await tracesPage.openExplorerTab();
  await page.waitForLoadState('networkidle');
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await page.waitForLoadState('networkidle');
  await tracesPage.filterBy('http.response.status_code : 502');
  await page.waitForLoadState('networkidle');
  
  // Clicks on the "View related error" in the timeline.
  await tracesPage.clickRelatedError();
  await servicesPage.assertVisibilityErrorDistributionChart();
});

test('APM - Dependencies', async ({ datePicker, dependenciesPage, landingPage, logsExplorerPage, page }) => {
  // Navigates to Observability > APM > Dependencies.
  await landingPage.clickDependencies();
  await dependenciesPage.assertVisibilityTable();

  // Filters data by selected date picker option.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await page.waitForLoadState('networkidle');

  // Selects the dependency, then navigates to the "Operations" tab.
  await dependenciesPage.clickTableRow();
  await dependenciesPage.assertVisibilityTable();
  await dependenciesPage.openOperationsTab();
  await dependenciesPage.assertVisibilityTable();

  // Clicks on the most impactful operation.
  await dependenciesPage.clickTableRow();
  await dependenciesPage.assertVisibilityTimelineTransaction();

  // Clicks on the transaction in the timeline to open the detailed view.
  await dependenciesPage.clickTimelineTransaction();
  await dependenciesPage.assertVisibilityTabPanel();

  // Clicks on "Investigate", selects "Trace logs".
  await dependenciesPage.clickInvestigateButton();
  await dependenciesPage.clickTraceLogsButton();
  await logsExplorerPage.assertVisibilityDataGridRow();
});