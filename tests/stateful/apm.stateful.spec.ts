import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { expect } from "@playwright/test";
import { spaceSelectorStateful, waitForOneOf } from "../../src/helpers.ts";
import { API_KEY } from '../../src/env.ts';

test.beforeAll('Check APM data', async ({request}) => {
  let response = await request.get('internal/apm/has_data', {
    headers: {
      "accept": "application/json",
      "Authorization": API_KEY,
      "Content-Type": "application/json;charset=UTF-8",
      "kbn-xsrf": "true",          
      "x-elastic-internal-origin": "kibana"
    },
    data: {}
  })
  expect(response.status()).toBe(200);
  const body = JSON.parse(await response.text());
  const hasData = body.hasData;
  test.skip(!hasData == true, 'Test is skipped due to lack of APM data.');
});

test.beforeEach(async ({ headerBar, sideNav, spaceSelector }) => {
  await sideNav.goto();
  await spaceSelectorStateful(headerBar, spaceSelector);
  await sideNav.clickObservabilitySolutionLink();
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status == testInfo.expectedStatus) {
    console.log(`✓ [${testInfo.title}] completed in ${testInfo.duration} ms.\n`);
}});

test('APM - Services', async ({ datePicker, logsExplorerPage, notifications, observabilityPage, servicesPage }, testInfo) => {
  const throughput = "throughput";
  const errorRate = "errorRate";

  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > APM > Services. Filters data by selected date picker option. Selects opbeans-go.`);
    await observabilityPage.clickServices();
    await datePicker.setPeriod();
    await servicesPage.selectServiceOpbeansGo();
    await Promise.race([
      servicesPage.assertVisibilityTransactionsTab(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data.');
      })
    ]);
  });
  
  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Opens the "Transactions" tab. Clicks on the most impactful transaction.`);
    await servicesPage.openTransactionsTab();
    await servicesPage.assertVisibilityVisualization(throughput);
    await servicesPage.selectMostImpactfulTransaction();
    await Promise.race([
      servicesPage.assertVisibilityVisualization(errorRate),
      servicesPage.assertTransactionErrorsNotFound().then(() => {
        throw new Error('Test is failed because transaction errors not found.');
      })
    ]);
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

test('APM - Traces', async ({ datePicker, notifications, observabilityPage, servicesPage, tracesPage }, testInfo) => {
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
    await Promise.race([
      tracesPage.assertRelatedError(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data.');
      })
    ]);
    await tracesPage.clickRelatedError();
    await servicesPage.assertVisibilityErrorDistributionChart();
  });
});

test('APM - Dependencies', async ({ datePicker, dependenciesPage, discoverPage, notifications, observabilityPage }, testInfo) => {  
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
      await Promise.race([
        dependenciesPage.assertVisibilityTable(),
        dependenciesPage.assertOperationsNotFound().then(() => {
          throw new Error('Test is failed because dependency operations not found');
        })
      ]);
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
      notifications.assertErrorFetchingResource().then(() => {
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