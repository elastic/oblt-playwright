import { test } from '../../tests/fixtures/serverless/basePage';
import { expect } from "@playwright/test";
import { spaceSelectorServerless } from "../../src/helpers.ts";
let apiKey = process.env.API_KEY;

test.beforeAll('Check APM data', async ({request}) => {
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
  const body = JSON.parse(await response.text());
  const hasData = body.hasData;
  test.skip(!hasData == true, 'Test is skipped due to lack of APM data.');
});

test.beforeEach(async ({ sideNav, spaceSelector }) => {
  await sideNav.goto();
  await spaceSelectorServerless(sideNav, spaceSelector);
  await sideNav.clickApplications();
});

test('APM - Services', async ({ datePicker, sideNav, discoverPage, notifications, servicesPage }, testInfo) => {
  const throughput = "throughput";
  const errorRate = "errorRate";

  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Sets period, then selects "opbeans-go" and asserts transaction tab visibility.`);
    await sideNav.clickServices();
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
    console.log(`\n[${testInfo.title}] Step 03 - Clicks on the "Failed transaction correlations" tab, asserts visualization visibility, then filters the result by a certain field value.`);
    await servicesPage.openFailedTransactionCorrelationsTab();
    await servicesPage.assertVisibilityCorrelationButton();
    await servicesPage.filterByFieldValue();
    await servicesPage.filterByCorrelationValue();
  });
  
  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Clicks on "Investigate", navigates to "Host logs".`);
    await servicesPage.clickInvestigate();
    await servicesPage.clickViewInDiscoverButton();
    await discoverPage.assertVisibilityCanvas();
  });
});

test('APM - Traces', async ({ datePicker, headerBar, sideNav, notifications, servicesPage, tracesPage }, testInfo) => {
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Sets period and waits for top traces table to be loaded.`);
    await sideNav.clickTraces();
    await datePicker.setPeriod();
    await Promise.race([
      headerBar.assertLoadingIndicator(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data.');
      })
    ]);
  });
  
  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Opens the "Explorer" tab, filters data by http.response.status_code : 502.`);
    await tracesPage.openExplorerTab();
    await tracesPage.filterBy('service.name : "opbeans-go" and http.response.status_code : 502');
  });
  
  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Clicks on the "View related error" in the timeline. Asserts related errors.`);
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

test('APM - Dependencies', async ({ datePicker, dependenciesPage, sideNav, discoverPage, notifications, headerBar }, testInfo) => {
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Dependencies section, then asserts dependencies table.`);
    await sideNav.clickDependencies();
    await dependenciesPage.assertVisibilityTable();
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Sets period, selects the dependency, then navigates to the "Operations" tab and asserts table visibility.`);
    await datePicker.setPeriod();
    await Promise.race([
      headerBar.assertLoadingIndicator(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data.');
      })
    ]);
    await dependenciesPage.clickTableRow();
    await dependenciesPage.assertVisibilityTable();
    await dependenciesPage.openOperationsTab();
    await Promise.race([
      dependenciesPage.assertVisibilityTable(),
      dependenciesPage.assertOperationsNotFound().then(() => {
        throw new Error('Test is failed because dependency operations not found');
      })
    ]);
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Clicks on the most impactful operation and asserts timeline visibility.`);
    await dependenciesPage.clickTableRow();
    await Promise.race([
      dependenciesPage.assertVisibilityTimelineTransaction(),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data.');
      })
    ]);
  });

  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Clicks on the transaction in the timeline and asserts tab panel visibility.`);
    await dependenciesPage.clickTimelineTransaction();
    await dependenciesPage.assertVisibilityTabPanel();
  });

  await test.step('step05', async () => {
    console.log(`\n[${testInfo.title}] Step 05 - Selects "Trace logs", then asserts data grid row.`);
    await dependenciesPage.clickInvestigateButton();
    await dependenciesPage.clickTraceLogsButton();
    await discoverPage.assertVisibilityDataGridRow();
  });
});
