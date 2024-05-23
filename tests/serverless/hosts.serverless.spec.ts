import { test } from '../fixtures/serverless/basePage';
import { expect } from "@playwright/test";
let apiKey = process.env.API_KEY;

test.beforeAll('Check node data', async ({ request }) => {
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
  if (response.status() == 200) {
    console.log(`✓ Node data is checked.`);
  }
});

test.beforeEach(async ({ landingPage }) => {
  await landingPage.goto();
  await landingPage.clickInfrastructure();
  await landingPage.clickHosts();
});

test('Hosts - Landing page.', async ({ datePicker, hostsPage, page }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "hostsView-metricChart-cpuUsage";
    const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";
    const memoryUsage = "hostsView-metricChart-memoryUsage";
    const memoryFree = "hostsView-metricChart-memoryFree";
    const diskSpaceAvailable = "hostsView-metricChart-diskSpaceAvailable";
    const diskIORead = "hostsView-metricChart-diskIORead";
    const diskIOWrite = "hostsView-metricChart-diskIOWrite";
    const diskReadThroughput = "hostsView-metricChart-diskReadThroughput";
    const diskWriteThroughput = "hostsView-metricChart-diskWriteThroughput";
    const rx = "hostsView-metricChart-rx";
    const tx = "hostsView-metricChart-tx";
  
    await test.step('step01', async () => {
        let startTime;
        let endTime;
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await hostsPage.setHostsLimit500();
        await datePicker.assertVisibilityDatePicker();
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue(process.env.TIME_VALUE);
        await datePicker.selectTimeUnit(process.env.TIME_UNIT);
        await datePicker.clickApplyButton();
        await page.evaluate("document.body.style.zoom=0.25");
        startTime = performance.now();
        await Promise.all([
            hostsPage.assertHostsNumber(),
            hostsPage.assertVisibilityHostsTable(),
            hostsPage.assertVisibilityVisualization(cpuUsageKPI),
            hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
            hostsPage.assertVisibilityVisualization(memoryUsageKPI),
            hostsPage.assertVisibilityVisualization(diskUsageKPI),
            hostsPage.assertVisibilityVisualization(cpuUsage), 
            hostsPage.assertVisibilityVisualization(normalizedLoad),
            hostsPage.assertVisibilityVisualization(memoryUsage), 
            hostsPage.assertVisibilityVisualization(memoryFree),
            hostsPage.assertVisibilityVisualization(diskSpaceAvailable), 
            hostsPage.assertVisibilityVisualization(diskIORead),
            hostsPage.assertVisibilityVisualization(diskIOWrite), 
            hostsPage.assertVisibilityVisualization(diskReadThroughput),
            hostsPage.assertVisibilityVisualization(diskWriteThroughput), 
            hostsPage.assertVisibilityVisualization(rx),
            hostsPage.assertVisibilityVisualization(tx)
        ]).then((values) => {
            endTime = performance.now();
            const now = new Date();
            console.log("\nTest date:", now.toISOString());
            console.log(`[${testInfo.title}] Last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}:`);
            console.log(values);
          });
        const elapsedTime = (endTime - startTime) / 1000;
        console.log("[Hosts landing page] All elements loading time:", elapsedTime);
        return elapsedTime;
    });
    
});

test('Hosts - Individual page.', async ({ datePicker, hostsPage, page }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";
    const memoryUsage = "infraAssetDetailsMetricChartmemoryUsage";
    const rxTx = "infraAssetDetailsMetricChartrxTx";
    const diskUsageByMountPoint = "infraAssetDetailsMetricChartdiskUsageByMountPoint";
    const diskIOReadWrite = "infraAssetDetailsMetricChartdiskIOReadWrite";
    const nodeCpuCapacity = "infraAssetDetailsMetricChartnodeCpuCapacity";
    const nodeMemoryCapacity = "infraAssetDetailsMetricChartnodeMemoryCapacity";

    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to individual host page.`);
        await hostsPage.clickTableCellHosts();
    });

    await test.step('step02', async () => {
        let startTime;
        let endTime;
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.assertVisibilityDatePicker();
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue(process.env.TIME_VALUE);
        await datePicker.selectTimeUnit(process.env.TIME_UNIT);
        await datePicker.clickApplyButton();
        await page.evaluate("document.body.style.zoom=0.25");
        startTime = performance.now();
        await Promise.all([
            hostsPage.assertVisibilityVisualization(cpuUsageKPI),
            hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
            hostsPage.assertVisibilityVisualization(memoryUsageKPI),
            hostsPage.assertVisibilityVisualization(diskUsageKPI),
            hostsPage.assertVisibilityVisualization(cpuUsage), 
            hostsPage.assertVisibilityVisualization(normalizedLoad),
            hostsPage.assertVisibilityVisualization(memoryUsage), 
            hostsPage.assertVisibilityVisualization(rxTx),
            hostsPage.assertVisibilityVisualization(diskUsageByMountPoint), 
            hostsPage.assertVisibilityVisualization(diskIOReadWrite),
            hostsPage.assertVisibilityVisualization(nodeCpuCapacity), 
            hostsPage.assertVisibilityVisualization(nodeMemoryCapacity),
        ]).then((values) => {
            endTime = performance.now();
            const now = new Date();
            console.log("\nTest date:", now.toISOString());
            console.log(`[${testInfo.title}] Last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}:`);
            console.log(values);
          });
        const elapsedTime = (endTime - startTime) / 1000;
        console.log("[Hosts individual page] All elements loading time:", elapsedTime);
        return elapsedTime;
    });
});

test('Hosts - Individual page - Metrics tab.', async ({ datePicker, hostsPage, page }, testInfo) => {
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const cpuUsageBreakdown = "infraAssetDetailsMetricChartcpuUsageBreakdown";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";
    const loadBreakdown = "infraAssetDetailsMetricChartloadBreakdown";
    const memoryUsage = "infraAssetDetailsMetricChartmemoryUsage";
    const memoryUsageBreakdown = "infraAssetDetailsMetricChartmemoryUsageBreakdown";
    const rxTx = "infraAssetDetailsMetricChartrxTx";
    const diskUsageByMountPoint = "infraAssetDetailsMetricChartdiskUsageByMountPoint";
    const diskIOReadWrite = "infraAssetDetailsMetricChartdiskIOReadWrite";
    const diskThroughput = "infraAssetDetailsMetricChartdiskThroughputReadWrite";
    const logRate = "infraAssetDetailsMetricChartlogRate";
    const nodeCpuCapacity = "infraAssetDetailsMetricChartnodeCpuCapacity";
    const nodeMemoryCapacity = "infraAssetDetailsMetricChartnodeMemoryCapacity";
    const nodeDiskCapacity = "infraAssetDetailsMetricChartnodeDiskCapacity";
    const nodePodCapacity = "infraAssetDetailsMetricChartnodePodCapacity";

    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Metrics tab.`);
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsMetricsTab();
    });

    await test.step('step02', async () => {
        let startTime;
        let endTime;
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.assertVisibilityDatePicker();
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue(process.env.TIME_VALUE);
        await datePicker.selectTimeUnit(process.env.TIME_UNIT);
        await datePicker.clickApplyButton();
        await page.evaluate("document.body.style.zoom=0.25");
        startTime = performance.now();
        await Promise.all([
            hostsPage.assertVisibilityVisualizationMetricsTab(cpuUsage),
            hostsPage.assertVisibilityVisualizationMetricsTab(cpuUsageBreakdown),
            hostsPage.assertVisibilityVisualizationMetricsTab(normalizedLoad),
            hostsPage.assertVisibilityVisualizationMetricsTab(loadBreakdown),
            hostsPage.assertVisibilityVisualizationMetricsTab(memoryUsage), 
            hostsPage.assertVisibilityVisualizationMetricsTab(memoryUsageBreakdown), 
            hostsPage.assertVisibilityVisualizationMetricsTab(rxTx),
            hostsPage.assertVisibilityVisualizationMetricsTab(diskUsageByMountPoint), 
            hostsPage.assertVisibilityVisualizationMetricsTab(diskIOReadWrite),
            hostsPage.assertVisibilityVisualizationMetricsTab(diskThroughput),
            hostsPage.assertVisibilityVisualizationMetricsTab(logRate),
            hostsPage.assertVisibilityVisualizationMetricsTab(nodeCpuCapacity), 
            hostsPage.assertVisibilityVisualizationMetricsTab(nodeMemoryCapacity),
            hostsPage.assertVisibilityVisualizationMetricsTab(nodeDiskCapacity),
            hostsPage.assertVisibilityVisualizationMetricsTab(nodePodCapacity)
        ]).then((values) => {
            endTime = performance.now();
            const now = new Date();
            console.log("\nTest date:", now.toISOString());
            console.log(`[${testInfo.title}] Last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}:`);
            console.log(values);
          });
        const elapsedTime = (endTime - startTime) / 1000;
        console.log("[Hosts individual page metric tab] All elements loading time:", elapsedTime);
        return elapsedTime;
    });
});