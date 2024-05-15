import { test } from '../../tests/fixtures/stateful/basePage';
import { expect } from "@playwright/test";
let apiKey = process.env.API_KEY;

test.beforeAll('Check node data', async ({request}) => {
  console.log(`... checking node data.`);
  const currentTime = Date.now();
  const rangeTime = currentTime - 1200000;

  let response = await request.post('api/metrics/snapshot', {
      headers: {
        "accept": "application/json",
        "Authorization": apiKey,
        "Content-Type": "application/json;charset=UTF-8",
        "kbn-xsrf": "true",          
        "x-elastic-internal-origin": "kibana"
      },
      data: {
        "filterQuery":"",
        "metrics":[{"type":"cpu"}],
        "nodeType":"host","sourceId":"default",
        "accountId":"",
        "region":"",
        "groupBy":[],
        "timerange":{"interval":"1m","to":currentTime,"from":rangeTime,"lookbackSize":5},
        "includeTimeseries":true,
        "dropPartialBuckets":true
      }
  })
  expect(response.status()).toBe(200);
  const jsonData = JSON.parse(await response.text());
  const nodesArr = jsonData.nodes;
  expect(nodesArr, 'The number of available nodes in the Inventory should not be less than 1.').not.toHaveLength(0);
  console.log(`✓ Node data is checked.`);
});

test.beforeEach(async ({ landingPage }) => {
  await landingPage.goto();
  await landingPage.clickObservabilitySolutionLink();
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status == testInfo.expectedStatus) {
    console.log(`✓ [${testInfo.title}] completed in ${testInfo.duration} ms.\n`);
}});

test('Infrastructure - Cluster Overview dashboard', async ({ dashboardPage, datePicker, page }, testInfo) => {
  const coresUsedVsTotal = "Cores used vs total cores";
  const topMemoryIntensivePods = "Top memory intensive pods";

  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Dashboards, filters dashboards by Kubernetes tag.`);
    await page.goto('/app/dashboards');
    await dashboardPage.assertVisibilityHeading();
    await dashboardPage.assertVisibilityTable();
    await dashboardPage.filterByKubernetesTag();
    await page.waitForLoadState('networkidle');
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Opens [Metrics Kubernetes] Cluster Overview dashboard.`);
    await page.getByRole('link', { name: "[Metrics Kubernetes] Cluster Overview" }).click();
    await page.waitForLoadState('networkidle');
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Filters data by selected time unit.`);
    await datePicker.clickDatePicker();
    await datePicker.fillTimeValue('1');
    await datePicker.selectTimeUnit('Hours');
    await datePicker.clickApplyButton();
  });

  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Logs Elasticsearch query - [Metrics Kubernetes] Cores used vs total cores.`);
    await dashboardPage.assertVisibilityVisualization(coresUsedVsTotal);
    await dashboardPage.kubernetesVisualizationOptions(coresUsedVsTotal);
    await dashboardPage.openRequestsView();
    await dashboardPage.queryToClipboard();
    await dashboardPage.logQuery(coresUsedVsTotal);
    await dashboardPage.closeFlyout();
  });
  
  await test.step('step05', async () => {
    console.log(`\n[${testInfo.title}] Step 05 - Logs Elasticsearch query - [Metrics Kubernetes] Top memory intensive pods.`);
    await dashboardPage.assertVisibilityVisualization(topMemoryIntensivePods);
    await dashboardPage.kubernetesVisualizationOptions(topMemoryIntensivePods);
    await dashboardPage.openRequestsView();
    await dashboardPage.queryToClipboard();
    await dashboardPage.logQuery(topMemoryIntensivePods);
    await dashboardPage.closeFlyout();
  });
});

test('Infrastructure - Inventory', async ({ datePicker, infrastructurePage, observabilityPage, page }, testInfo) => {
  const cpuUsage = "infraAssetDetailsKPIcpuUsage";
  const memoryUsage = "infraAssetDetailsHostMetricsChartmemoryUsage";
  const podCpuUsage = "podCpuUsage";
  const podMemoryUsage = "podMemoryUsage";
  
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > Infrastructure > Inventory.`);
    await observabilityPage.clickInventory();
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Clicks on any displayed host to open the detailed view.`);
    await infrastructurePage.clickDismiss();
    await infrastructurePage.sortByMetricValue();
    await infrastructurePage.clickNodeWaffleContainer();
  });
  
  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Filters data by selected time unit. Asserts "Host CPU Usage" & "Host Memory Usage" visualizations visibility.`);
    await datePicker.clickDatePicker();
    if (await datePicker.assertSelectedDate()) {
      await datePicker.selectDate();
    } else {    
      await datePicker.fillTimeValue('30');
      await datePicker.selectTimeUnit('Days');
      await datePicker.clickApplyButton();
    }
    await page.waitForLoadState('networkidle');
    await infrastructurePage.assertVisibilityVisualization(cpuUsage);
    await infrastructurePage.assertVisibilityVisualization(memoryUsage);
  });

  await test.step('step04', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Returns back to Observability > Infrastructure > Inventory. Selects "Pods" as "Show" option.`);
    await infrastructurePage.closeInfraAssetDetailsFlyout();
    await infrastructurePage.switchInventoryToPodsView();
    await page.waitForLoadState('networkidle');
  });

  await test.step('step05', async () => {
    console.log(`\n[${testInfo.title}] Step 05 - Clicks on the tile of some pod, then clicks on the "Kubernetes Pod metrics" link.`);
    await infrastructurePage.sortByMetricValue();
    await infrastructurePage.switchToTableView();
    await page.waitForLoadState('networkidle');
    await infrastructurePage.clickTableCell();
    await infrastructurePage.clickPopoverK8sMetrics();
  });

  await test.step('step06', async () => {
    console.log(`\n[${testInfo.title}] Step 06 - Filters data by selected date picker option. Asserts "Pod CPU Usage" & "Pod Memory Usage" visualization visibility.`);
    await datePicker.assertVisibilityDatePicker();
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await infrastructurePage.assertVisibilityPodVisualization(podCpuUsage);
    await infrastructurePage.assertVisibilityPodVisualization(podMemoryUsage);
  });
});

test('Infrastructure - Hosts', async ({ datePicker, infrastructurePage, observabilityPage, page }, testInfo) => {
  const cpuUsage = "hostsView-metricChart-cpuUsage";
  const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";
   
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > Infrastructure > Hosts.`);
    await observabilityPage.clickHosts();
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts "Host CPU Usage" & "Host Normalized Load" visualizations visibility.`);
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
    await infrastructurePage.assertVisibilityVisualization(cpuUsage);
    await infrastructurePage.assertVisibilityVisualization(normalizedLoad);
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Clicks the "Logs" tab, filters logs by searching errors.`);
    await infrastructurePage.openHostsLogs();
    await infrastructurePage.searchErrors();
  });
});

// Skipped until Metrics Explorer is available in Serverless.
test.skip('Infrastructure - Metrics Explorer', async ({ datePicker, infrastructurePage, observabilityPage, page }, testInfo) => {
  await test.step('step01', async () => {
    console.log(`\n[${testInfo.title}] Step 01 - Navigates to Observability > Infrastructure > Metrics Explorer.`);
    await observabilityPage.clickMetricsExplorer();
    await infrastructurePage.assertVisibilityMetricsCanvas();
  });

  await test.step('step02', async () => {
    console.log(`\n[${testInfo.title}] Step 02 - Aggregates by 95th Percentile.`);
    await infrastructurePage.aggregateBy95thPercentile();
    await page.waitForLoadState('networkidle');
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 03 - Filters data by selected date picker option.`);
    await datePicker.assertVisibilityDatePicker();
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
    await page.waitForLoadState('networkidle');
  });

  await test.step('step03', async () => {
    console.log(`\n[${testInfo.title}] Step 04 - Selects "kubernetes.namespace" as "graph per" option. Searches for "kube-system".`);
    await infrastructurePage.graphPerKubernetesNamespace();
    await page.waitForLoadState('networkidle');
    await infrastructurePage.filterByKubesystemNamespace();
    await infrastructurePage.assertVisibilityMetricsCanvas();
  });
});