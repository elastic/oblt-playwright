import { test } from '../fixtures/serverless/basePage';
import { expect } from "@playwright/test";
import { getPodData, spaceSelectorServerless } from "../../src/helpers.ts";

test.beforeAll('Check pod data', async ({ request }) => {
  const podsData = await getPodData(request);
  const podsArr = podsData.nodes;
  test.skip(podsArr.length == 0, 'Test is skipped due to lack of pod data.');
});

test.beforeEach(async ({ sideNav, spaceSelector }) => {
  await sideNav.goto();
  await spaceSelectorServerless(sideNav, spaceSelector);
  await sideNav.clickInfrastructure();
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status == testInfo.expectedStatus) {
    console.log(`✓ [${testInfo.title}] completed in ${testInfo.duration} ms.\n`);
}});

test.skip('Infrastructure - Cluster Overview dashboard', async ({ dashboardPage, datePicker, headerBar, sideNav, notifications, page }, testInfo) => {
  const coresUsedVsTotal = "Cores used vs total cores";
  const topMemoryIntensivePods = "Top Memory intensive pods per Node";

  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Dashboards, opens [Metrics Kubernetes] Cluster Overview dashboard.`);
    await sideNav.clickDashboards();
    await dashboardPage.assertVisibilityHeading();
    await dashboardPage.assertVisibilityTable();
    await dashboardPage.searchDashboard('Cluster Overview');
    await page.keyboard.press('Enter');
    await Promise.race([
      expect(page.getByRole('link', { name: "[Metrics Kubernetes] Cluster Overview" })).toBeVisible(),
      dashboardPage.assertNoDashboard().then(() => {
        throw new Error('Test is failed because no dashboard found.');
        })
      ]);
    await page.getByRole('link', { name: "[Metrics Kubernetes] Cluster Overview" }).click();
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts visualizations visibility.`);
    await datePicker.clickDatePicker();
    await datePicker.fillTimeValue(process.env.TIME_VALUE);
    await datePicker.selectTimeUnit(process.env.TIME_UNIT);
    await datePicker.clickApplyButton();
    await Promise.race([
      Promise.all([
        headerBar.assertLoadingIndicator(),
        dashboardPage.assertVisibilityVisualization(coresUsedVsTotal),
        dashboardPage.assertVisibilityVisualization(topMemoryIntensivePods)
          ]),
      dashboardPage.assertEmbeddedError(coresUsedVsTotal).then(() => {
        throw new Error('Test is failed due to an error when loading visualization.');
        }),
      dashboardPage.assertEmbeddedError(topMemoryIntensivePods).then(() => {
        throw new Error('Test is failed due to an error when loading visualization.');
        }),
      dashboardPage.assertNoData(coresUsedVsTotal).then(() => {
        throw new Error('Test is failed because no results found.');
        }),
      dashboardPage.assertNoData(topMemoryIntensivePods).then(() => {
        throw new Error('Test is failed because no results found.');
        }),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data.');
        })
      ]);
  });
});

test('Infrastructure - Inventory', async ({ datePicker, inventoryPage, sideNav }, testInfo) => {
  const cpuUsage = "infraAssetDetailsKPIcpuUsage";
  const memoryUsage = "infraAssetDetailsKPImemoryUsage";
  const podCpuUsage = "podCpuUsage";
  const podMemoryUsage = "podMemoryUsage";

  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Infrastructure > Inventory. Clicks on any displayed host to open the detailed view.`);
    await sideNav.clickInventory();
    await Promise.race([
      inventoryPage.assertWaffleMap(),
      inventoryPage.assertNoData().then(() => {
        throw new Error('Test is failed because there is no data to display');
        })
      ]);
    await inventoryPage.clickDismiss();
    await inventoryPage.sortByMetricValue();
    await inventoryPage.memoryUsage();
    await inventoryPage.clickNodeWaffleContainer();
  });
  
  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts "Host CPU Usage" & "Host Memory Usage" visualizations visibility.`);
    await datePicker.setPeriod();
    await Promise.all([
      inventoryPage.assertVisibilityVisualization(cpuUsage),
      inventoryPage.assertVisibilityVisualization(memoryUsage)
      ]);
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Returns back to Infrastructure > Inventory. Selects "Pods" as "Show" option. Clicks on the tile of some pod, then clicks on the "Kubernetes Pod metrics" link.`);
    await inventoryPage.closeInfraAssetDetailsFlyout();
    await inventoryPage.switchInventoryToPodsView();
    await Promise.race([
      inventoryPage.assertWaffleMap(),
      inventoryPage.assertNoData().then(() => {
        throw new Error('Test is failed because there is no data to display');
        })
      ]);
    await inventoryPage.sortByMetricValue();
    await inventoryPage.switchToTableView();
    await inventoryPage.clickTableCell();
    await inventoryPage.clickPopoverK8sMetrics();
  });

  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Filters data by selected date picker option. Asserts "Pod CPU Usage" & "Pod Memory Usage" visualization visibility.`);
    await datePicker.setPeriod();
    await Promise.race([
      Promise.all([
        inventoryPage.assertVisibilityPodVisualization(podCpuUsage),
        inventoryPage.assertVisibilityPodVisualization(podMemoryUsage)
        ]),
      inventoryPage.assertNoData().then(() => {
        throw new Error('Test is failed because there is no data to display');
        })
    ]);
  });
});
