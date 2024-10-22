import { test } from '../../tests/fixtures/stateful/basePage';
import { checkPodData, spaceSelectorStateful } from "../../src/helpers.ts";
let apiKey = process.env.API_KEY;

test.beforeAll('Check pod data', async ({request}) => {
  await checkPodData(request);
});

test.beforeEach(async ({ headerBar, sideNav, spaceSelector }) => {
  await sideNav.goto();
  await spaceSelectorStateful(headerBar, spaceSelector);
  await sideNav.clickObservabilitySolutionLink();
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status == testInfo.expectedStatus) {
    console.log(`✓ [${testInfo.title}] completed in ${testInfo.duration} ms.\n`);
  }
});

test('Infrastructure - Cluster Overview dashboard', async ({ dashboardPage, datePicker, headerBar, page }, testInfo) => {
  const coresUsedVsTotal = "Cores used vs total cores";
  const topMemoryIntensivePods = "Top Memory intensive pods per Node";

  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Dashboards, filters dashboards by Kubernetes tag.`);
    await page.goto('/app/dashboards');
    await dashboardPage.assertVisibilityHeading();
    await dashboardPage.assertVisibilityTable();
    await dashboardPage.searchDashboard('Cluster Overview');
    await page.keyboard.press('Enter');
    await page.getByRole('link', { name: "[Metrics Kubernetes] Cluster Overview" }).click();
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit.`);
    await datePicker.clickDatePicker();
    await datePicker.fillTimeValue(process.env.TIME_VALUE);
    await datePicker.selectTimeUnit(process.env.TIME_UNIT);
    await datePicker.clickApplyButton();
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Asserts visualizations visibility.`);
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
        })
      ]);
  });
});

test('Infrastructure - Inventory', async ({ datePicker, inventoryPage, observabilityPage, page }, testInfo) => {
  const cpuUsage = "infraAssetDetailsKPIcpuUsage";
  const memoryUsage = "infraAssetDetailsMetricChartmemoryUsage";
  const podCpuUsage = "podCpuUsage";
  const podMemoryUsage = "podMemoryUsage";
  
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > Infrastructure > Inventory.`);
    await observabilityPage.clickInventory();
    await Promise.race([
      inventoryPage.assertWaffleMap(),
      inventoryPage.assertNoData().then(() => {
        throw new Error('Test is failed because there is no data to display');
        })
      ]);
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Clicks on any displayed host to open the detailed view.`);
    await inventoryPage.clickDismiss();
    await inventoryPage.sortByMetricValue();
    await inventoryPage.memoryUsage();
    await inventoryPage.clickNodeWaffleContainer();
  });
  
  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Filters data by selected time unit. Asserts "Host CPU Usage" & "Host Memory Usage" visualizations visibility.`);
    await page.evaluate("document.body.style.zoom=0.8");
    await datePicker.setPeriod();
    await Promise.all([
      inventoryPage.assertVisibilityVisualization(cpuUsage),
      inventoryPage.assertVisibilityVisualization(memoryUsage)
    ]);
  });

  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Returns back to Observability > Infrastructure > Inventory. Selects "Pods" as "Show" option.`);
    await inventoryPage.closeInfraAssetDetailsFlyout();
    await inventoryPage.switchInventoryToPodsView();
    await Promise.race([
      inventoryPage.assertWaffleMap(),
      inventoryPage.assertNoData().then(() => {
        throw new Error('Test is failed because there is no data to display');
        })
      ]);
  });

  await test.step('step05', async () => {
    console.log(`\n[${testInfo.title}] Step 05 - Clicks on the tile of some pod, then clicks on the "Kubernetes Pod metrics" link.`);
    await inventoryPage.sortByMetricValue();
    await inventoryPage.switchToTableView();
    await inventoryPage.clickTableCell();
    await inventoryPage.clickPopoverK8sMetrics();
  });

  await test.step('step06', async () => {
    console.log(`\n[${testInfo.title}] Step 06 - Filters data by selected date picker option. Asserts "Pod CPU Usage" & "Pod Memory Usage" visualization visibility.`);
    await datePicker.setPeriod();
    await Promise.all([
      inventoryPage.assertVisibilityPodVisualization(podCpuUsage),
      inventoryPage.assertVisibilityPodVisualization(podMemoryUsage)
      ]);
  });
});

// Skipped until Metrics Explorer is available in Serverless.
test.skip('Infrastructure - Metrics Explorer', async ({ datePicker, inventoryPage, observabilityPage }, testInfo) => {
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > Infrastructure > Metrics Explorer.`);
    await observabilityPage.clickMetricsExplorer();
    await inventoryPage.assertVisibilityMetricsCanvas();
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Aggregates by 95th Percentile.`);
    await inventoryPage.aggregateBy95thPercentile();
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Filters data by selected date picker option.`);
    await datePicker.setPeriod();
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Selects "kubernetes.namespace" as "graph per" option. Searches for "kube-system".`);
    await inventoryPage.graphPerKubernetesNamespace();
    await inventoryPage.filterByKubesystemNamespace();
    await inventoryPage.assertVisibilityMetricsCanvas();
  });
});