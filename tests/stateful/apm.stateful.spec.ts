import { test } from '../../tests/fixtures/stateful/basePage';
import { expect } from "@playwright/test";
import { waitForOneOf } from "../../src/types.ts";
let apiKey = process.env.API_KEY;

test.beforeAll('Check APM data', async ({request}) => {
  console.log(`... checking APM data.`);
  let response = await request.get('internal/apm/has_data', {
      headers: {
        "accept": "application/json",
        "Authorization": apiKey,
        "Content-Type": "application/json;charset=UTF-8",
        "kbn-xsrf": "true",          
        "x-elastic-internal-origin": "kibana"
      },
      data: {}
  })
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body, 'Availability of APM data').toContain("true");
  if (response.status() == 200) {
    console.log(`✓ APM data is checked.`);
  };
});

test.beforeEach(async ({ landingPage, page }) => {
  await landingPage.goto();
  const [ index ] = await waitForOneOf([
    page.locator('xpath=//a[@aria-label="Elastic home"]'),
    landingPage.spaceSelector(),
    ]);
  const spaceSelector = index === 1;
  if (spaceSelector) {
      await page.locator('xpath=//a[contains(text(),"Default")]').click();
      await expect(page.locator('xpath=//a[@aria-label="Elastic home"]')).toBeVisible();
    };
  await landingPage.clickObservabilitySolutionLink();
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status == testInfo.expectedStatus) {
    console.log(`✓ [${testInfo.title}] completed in ${testInfo.duration} ms.\n`);
}});

test('APM - Services', async ({ datePicker, logsExplorerPage, observabilityPage, page, servicesPage }, testInfo) => {
  const throughput = "throughput";

  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > APM > Services. Filters data by selected date picker option. Selects opbeans-go.`);
    await observabilityPage.clickServices();
    await datePicker.setPeriod();
    await servicesPage.selectServiceOpbeansGo();
  });
  
  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Opens the "Transactions" tab. Clicks on the most impactful transaction.`);
    await servicesPage.openTransactionsTab();
    await servicesPage.assertVisibilityVisualization(throughput);
    await servicesPage.selectMostImpactfulTransaction();
    await servicesPage.assertVisibilityVisualization(throughput);
    if (servicesPage.errorFetchingResource()) {
      throw new Error('Test is failed due to an error when loading data.');
    }
  });
  
  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Clicks on the "Failed transaction correlations" tab. Filters the result by a particular field value.`);
    await servicesPage.openFailedTransactionCorrelationsTab();
    await servicesPage.assertVisibilityCorrelationButton();
    await servicesPage.filterByFieldValue();
    await servicesPage.filterByCorrelationValue();
  });
  
  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Clicks on "Investigate", navigates to "Logs Explorer".`);
    await servicesPage.clickInvestigate();
    await servicesPage.clickHostLogsButton();
    await observabilityPage.clickExplorer();
    await logsExplorerPage.assertVisibilityCanvas();
  });
  
  await test.step('step05', async () => {
    console.log(`\n[${testInfo.title}] Step 05 - Filters logs by selected date picker option, then filters by error messages. Expands certain document.`);
    await datePicker.setPeriod();
    await logsExplorerPage.filterLogsByError();
    await logsExplorerPage.assertVisibilityDataGridRow();
    await logsExplorerPage.expandLogsDataGridRow();
  });
});

test('APM - Traces', async ({ datePicker, observabilityPage, page, servicesPage, tracesPage }, testInfo) => {
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > APM > Traces.`);
    await observabilityPage.clickTraces();
  });
  
  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Opens the "Explorer" tab, filters data by http.response.status_code : 502.`);
    await tracesPage.openExplorerTab();
    await datePicker.setPeriod();
    await tracesPage.filterBy('service.name : "opbeans-go" and http.response.status_code : 502');
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
    await datePicker.setPeriod();
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Selects the dependency, then navigates to the "Operations" tab.`);
    const [ index ] = await waitForOneOf([
      dependenciesPage.dependencyTableLoaded(),
      dependenciesPage.dependencyTableNotLoaded()
      ]);
    const tableLoaded = index === 0;
    if (tableLoaded) {
      await dependenciesPage.clickTableRow();
      await dependenciesPage.assertVisibilityTable();
      await dependenciesPage.openOperationsTab();
      await dependenciesPage.assertVisibilityTable();
    } else {
      console.log('Dependencies table not loaded.');
      throw new Error('Test is failed due to an error when loading dependencies table.');
    }
  });

  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Clicks on the most impactful operation.`);
    await dependenciesPage.clickTableRow();
    await Promise.race([
      dependenciesPage.assertVisibilityTimelineTransaction(),
      dependenciesPage.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data.');
      })
    ]);
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