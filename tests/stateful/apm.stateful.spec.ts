import {test} from '../../tests/fixtures/stateful/basePage';

test.beforeEach(async ({ landingPage }) => {
  await landingPage.goto();
  await landingPage.clickObservabilitySolutionLink();
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.log(`...[${testInfo.title}] failed due to ${testInfo.error}`);
} else {
    console.log(`✓ [${testInfo.title}] completed in ${testInfo.duration} ms.\n`);
}});

test('APM - Services', async ({ datePicker, logsExplorerPage, observabilityPage, page, servicesPage }, testInfo) => {
  const throughput = "throughput";
  
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > APM > Services. Selects opbeans-go.`);
    await observabilityPage.clickServices();
    await servicesPage.selectServiceOpbeansGo();
    await page.waitForLoadState('networkidle');
  });
  
  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected date picker option.`);
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
  });
  
  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Opens the "Transactions" tab. Clicks on the most impactful transaction.`);
    await servicesPage.openTransactionsTab();
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await servicesPage.assertVisibilityVisualization(throughput);
    await servicesPage.selectMostImpactfulTransaction();
    await servicesPage.assertVisibilityVisualization(throughput);
  });
  
  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Clicks on the "Failed transaction correlations" tab. Filters the result by a particular field value.`);
    await servicesPage.openFailedTransactionCorrelationsTab();
    await page.waitForLoadState('networkidle');
    await servicesPage.assertVisibilityCorrelationButton();
    await servicesPage.filterByFieldValue();
    await servicesPage.filterByCorrelationValue();
    await page.waitForLoadState('networkidle');
  });
  
  await test.step('step05', async () => {
    console.log(`\n[${testInfo.title}] Step 05 - Clicks on "Investigate", navigates to "Logs Explorer".`);
    await servicesPage.clickInvestigate();
    await servicesPage.clickHostLogsButton();
    await observabilityPage.clickExplorer();
    await logsExplorerPage.assertVisibilityCanvas();
  });
  
  await test.step('step06', async () => {
    console.log(`\n[${testInfo.title}] Step 06 - Filters logs by selected date picker option, then filters by error messages. Expands certain document.`);
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
    await logsExplorerPage.filterLogsByError();
    await logsExplorerPage.assertVisibilityDataGridRow();
    await logsExplorerPage.expandLogsDataGridRow();
    await page.waitForLoadState('networkidle');
  });
});

test('APM - Traces', async ({ datePicker, observabilityPage, page, servicesPage, tracesPage }, testInfo) => {
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > APM > Traces.`);
    await observabilityPage.clickTraces();
    await page.waitForLoadState('networkidle');
  });
  
  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Opens the "Explorer" tab, filters data by http.response.status_code : 502.`);
    await tracesPage.openExplorerTab();
    await page.waitForLoadState('networkidle');
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
    await tracesPage.filterBy('http.response.status_code : 502');
    await page.waitForLoadState('networkidle');
  });
  
  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Clicks on the "View related error" in the timeline.`);
    await tracesPage.clickRelatedError();
    await servicesPage.assertVisibilityErrorDistributionChart();
  });
});

test('APM - Dependencies', async ({ datePicker, dependenciesPage, discoverPage, observabilityPage, page }, testInfo) => {  
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > APM > Dependencies.`);
    await observabilityPage.clickDependencies();
    await dependenciesPage.assertVisibilityTable();
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected date picker option.`);
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Selects the dependency, then navigates to the "Operations" tab.`);
    await dependenciesPage.clickTableRow();
    await dependenciesPage.assertVisibilityTable();
    await dependenciesPage.openOperationsTab();
    await dependenciesPage.assertVisibilityTable();
  });

  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Clicks on the most impactful operation.`);
    await dependenciesPage.clickTableRow();
    await dependenciesPage.assertVisibilityTimelineTransaction();
  });

  await test.step('step05', async () => {
    console.log(`\n[${testInfo.title}] Step 05 - Clicks on the transaction in the timeline to open the detailed view.`);
    await dependenciesPage.clickTimelineTransaction();
    await dependenciesPage.assertVisibilityTabPanel();
  });

  await test.step('step06', async () => {
    console.log(`\n[${testInfo.title}] Step 06 - Clicks on "Investigate", selects "View transaction in Discover".`);
    await dependenciesPage.clickInvestigateButton();
    await dependenciesPage.clickViewInDiscover();
    await discoverPage.assertVisibilityDataGridRow();
  });
});