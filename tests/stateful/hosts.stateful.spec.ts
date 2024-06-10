import { test } from '../fixtures/stateful/basePage';
import { expect } from "@playwright/test";
const apiKey = process.env.API_KEY;
const fs = require('fs');
const path = require('path');
const outputDirectory = process.env.HOSTS_DIR;

function writeFileReport(testStartTime, testInfo, asyncResults) {
    const resultsObj = asyncResults.reduce((acc, obj) => {
        return { ...acc, ...obj };
    }, {});
    const fileName = `[stateful]_${testStartTime}_${testInfo.title.replace(/\s/g, "_").toLowerCase()}.json`;
    const outputPath = path.join(outputDirectory, fileName);
    const reportData = {
        name: testInfo.title,
        deployment: "stateful",
        date: testStartTime,
        time_window: `Last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`,
        measurements: resultsObj
    };        
    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
    console.log(reportData);
}

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

test.beforeEach(async ({ landingPage, observabilityPage }) => {
  await landingPage.goto();
  await landingPage.clickObservabilitySolutionLink();
  await observabilityPage.clickHosts();
});

test('Hosts - Landing page', async ({ datePicker, hostsPage, page }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "hostsView-metricChart-cpuUsage";
    const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";
    // const memoryUsage = "hostsView-metricChart-memoryUsage";
    // const memoryFree = "hostsView-metricChart-memoryFree";
    // const diskSpaceAvailable = "hostsView-metricChart-diskSpaceAvailable";
    // const diskIORead = "hostsView-metricChart-diskIORead";
    // const diskIOWrite = "hostsView-metricChart-diskIOWrite";
    // const diskReadThroughput = "hostsView-metricChart-diskReadThroughput";
    // const diskWriteThroughput = "hostsView-metricChart-diskWriteThroughput";
    // const rx = "hostsView-metricChart-rx";
    // const tx = "hostsView-metricChart-tx";
  
    await test.step('step01', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await hostsPage.setHostsLimit500();
        await datePicker.assertVisibilityDatePicker();
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue(process.env.TIME_VALUE);
        await datePicker.selectTimeUnit(process.env.TIME_UNIT);
        await datePicker.clickApplyButton();
        // await page.evaluate("document.body.style.zoom=0.25");

        const asyncResults = await Promise.all([
            hostsPage.assertHostsNumber(),
            hostsPage.assertVisibilityHostsTable(),
            hostsPage.assertVisibilityVisualization(cpuUsageKPI),
            hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
            hostsPage.assertVisibilityVisualization(memoryUsageKPI),
            hostsPage.assertVisibilityVisualization(diskUsageKPI),
            hostsPage.assertVisibilityVisualization(cpuUsage), 
            hostsPage.assertVisibilityVisualization(normalizedLoad),
            // hostsPage.assertVisibilityVisualization(memoryUsage), 
            // hostsPage.assertVisibilityVisualization(memoryFree),
            // hostsPage.assertVisibilityVisualization(diskSpaceAvailable), 
            // hostsPage.assertVisibilityVisualization(diskIORead),
            // hostsPage.assertVisibilityVisualization(diskIOWrite), 
            // hostsPage.assertVisibilityVisualization(diskReadThroughput),
            // hostsPage.assertVisibilityVisualization(diskWriteThroughput), 
            // hostsPage.assertVisibilityVisualization(rx),
            // hostsPage.assertVisibilityVisualization(tx)
        ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Individual page', async ({ datePicker, hostsPage, page }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";
    // const memoryUsage = "infraAssetDetailsMetricChartmemoryUsage";
    // const rxTx = "infraAssetDetailsMetricChartrxTx";
    // const diskUsageByMountPoint = "infraAssetDetailsMetricChartdiskUsageByMountPoint";
    // const diskIOReadWrite = "infraAssetDetailsMetricChartdiskIOReadWrite";
    // const nodeCpuCapacity = "infraAssetDetailsMetricChartnodeCpuCapacity";
    // const nodeMemoryCapacity = "infraAssetDetailsMetricChartnodeMemoryCapacity";

    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to individual host page.`);
        await hostsPage.clickTableCellHosts();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.assertVisibilityDatePicker();
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue(process.env.TIME_VALUE);
        await datePicker.selectTimeUnit(process.env.TIME_UNIT);
        await datePicker.clickApplyButton();
        // await page.evaluate("document.body.style.zoom=0.25");

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityVisualization(cpuUsageKPI),
            hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
            hostsPage.assertVisibilityVisualization(memoryUsageKPI),
            hostsPage.assertVisibilityVisualization(diskUsageKPI),
            hostsPage.assertVisibilityVisualization(cpuUsage), 
            hostsPage.assertVisibilityVisualization(normalizedLoad),
            // hostsPage.assertVisibilityVisualization(memoryUsage), 
            // hostsPage.assertVisibilityVisualization(rxTx),
            // hostsPage.assertVisibilityVisualization(diskUsageByMountPoint), 
            // hostsPage.assertVisibilityVisualization(diskIOReadWrite),
            // hostsPage.assertVisibilityVisualization(nodeCpuCapacity), 
            // hostsPage.assertVisibilityVisualization(nodeMemoryCapacity),
        ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Individual page - Metadata tab', async ({ datePicker, hostsPage, page }, testInfo) => {
    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Metadata tab.`);
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsMetadataTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.assertVisibilityDatePicker();
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue(process.env.TIME_VALUE);
        await datePicker.selectTimeUnit(process.env.TIME_UNIT);
        await datePicker.clickApplyButton();
        await page.reload();

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityHostsMetadataTable()
        ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Individual page - Metrics tab', async ({ datePicker, hostsPage, page }, testInfo) => {
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const cpuUsageBreakdown = "infraAssetDetailsMetricChartcpuUsageBreakdown";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";
    const loadBreakdown = "infraAssetDetailsMetricChartloadBreakdown";
    const memoryUsage = "infraAssetDetailsMetricChartmemoryUsage";
    const memoryUsageBreakdown = "infraAssetDetailsMetricChartmemoryUsageBreakdown";
    // const rxTx = "infraAssetDetailsMetricChartrxTx";
    // const diskUsageByMountPoint = "infraAssetDetailsMetricChartdiskUsageByMountPoint";
    // const diskIOReadWrite = "infraAssetDetailsMetricChartdiskIOReadWrite";
    // const diskThroughput = "infraAssetDetailsMetricChartdiskThroughputReadWrite";
    // const logRate = "infraAssetDetailsMetricChartlogRate";
    // const nodeCpuCapacity = "infraAssetDetailsMetricChartnodeCpuCapacity";
    // const nodeMemoryCapacity = "infraAssetDetailsMetricChartnodeMemoryCapacity";
    // const nodeDiskCapacity = "infraAssetDetailsMetricChartnodeDiskCapacity";
    // const nodePodCapacity = "infraAssetDetailsMetricChartnodePodCapacity";

    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Metrics tab.`);
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsMetricsTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.assertVisibilityDatePicker();
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue(process.env.TIME_VALUE);
        await datePicker.selectTimeUnit(process.env.TIME_UNIT);
        await datePicker.clickApplyButton();
        // await page.evaluate("document.body.style.zoom=0.25");

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityVisualizationMetricsTab(cpuUsage),
            hostsPage.assertVisibilityVisualizationMetricsTab(cpuUsageBreakdown),
            hostsPage.assertVisibilityVisualizationMetricsTab(normalizedLoad),
            hostsPage.assertVisibilityVisualizationMetricsTab(loadBreakdown),
            hostsPage.assertVisibilityVisualizationMetricsTab(memoryUsage), 
            hostsPage.assertVisibilityVisualizationMetricsTab(memoryUsageBreakdown), 
            // hostsPage.assertVisibilityVisualizationMetricsTab(rxTx),
            // hostsPage.assertVisibilityVisualizationMetricsTab(diskUsageByMountPoint), 
            // hostsPage.assertVisibilityVisualizationMetricsTab(diskIOReadWrite),
            // hostsPage.assertVisibilityVisualizationMetricsTab(diskThroughput),
            // hostsPage.assertVisibilityVisualizationMetricsTab(logRate),
            // hostsPage.assertVisibilityVisualizationMetricsTab(nodeCpuCapacity), 
            // hostsPage.assertVisibilityVisualizationMetricsTab(nodeMemoryCapacity),
            // hostsPage.assertVisibilityVisualizationMetricsTab(nodeDiskCapacity),
            // hostsPage.assertVisibilityVisualizationMetricsTab(nodePodCapacity)
        ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Individual page - Profiling tab', async ({ datePicker, hostsPage, page }, testInfo) => {
    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Profiling tab.`);
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsProfilingTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.assertVisibilityDatePickerHostsProfiling();
        await datePicker.clickDatePickerHostsProfiling();
        await datePicker.fillTimeValue(process.env.TIME_VALUE);
        await datePicker.selectTimeUnit(process.env.TIME_UNIT);
        await datePicker.clickApplyButton();
        // await page.evaluate("document.body.style.zoom=0.25");

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityProfilingFlamegraph()
        ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});