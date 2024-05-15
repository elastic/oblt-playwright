import { test } from '../fixtures/serverless/basePage';
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
  await landingPage.clickInfrastructure();
  await landingPage.clickHosts();
});

test('Hosts - Landing page.', async ({ datePicker, infrastructurePage, page }, testInfo) => {
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

    let startTime;
    let endTime;
  
    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Filters data by selected time unit. Asserts visualizations loading time.`);
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue('90');
        await datePicker.selectTimeUnit('Days');
        await datePicker.clickApplyButton();
        startTime = performance.now();
        await page.evaluate("document.body.style.zoom=0.25");
        await Promise.all([
            infrastructurePage.assertVisibilityKPIGrid(cpuUsageKPI),
            infrastructurePage.assertVisibilityKPIGrid(normalizedLoadKPI),
            infrastructurePage.assertVisibilityKPIGrid(memoryUsageKPI),
            infrastructurePage.assertVisibilityKPIGrid(diskUsageKPI),
            infrastructurePage.assertVisibilityVisualization(cpuUsage), 
            infrastructurePage.assertVisibilityVisualization(normalizedLoad),
            infrastructurePage.assertVisibilityVisualization(memoryUsage), 
            infrastructurePage.assertVisibilityVisualization(memoryFree),
            infrastructurePage.assertVisibilityVisualization(diskSpaceAvailable), 
            infrastructurePage.assertVisibilityVisualization(diskIORead),
            infrastructurePage.assertVisibilityVisualization(diskIOWrite), 
            infrastructurePage.assertVisibilityVisualization(diskReadThroughput),
            infrastructurePage.assertVisibilityVisualization(diskWriteThroughput), 
            infrastructurePage.assertVisibilityVisualization(rx),
            infrastructurePage.assertVisibilityVisualization(tx)
        ]).then((values) => {
            console.log(values);
          });
        endTime = performance.now();
    });
    const elapsedTime = endTime - startTime;
    console.log("[Hosts landing page] All visualizations loading time:", elapsedTime);
  });

test('Hosts - Individual page.', async ({ datePicker, infrastructurePage, page }, testInfo) => {
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

    let startTime;
    let endTime;

    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to individual host page.`);
        await infrastructurePage.clickTableCellHosts();
    });

    await test.step('step02', async () => {
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts visualizations loading time.`);
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue('90');
        await datePicker.selectTimeUnit('Days');
        await datePicker.clickApplyButton();
        startTime = performance.now();
        await page.evaluate("document.body.style.zoom=0.25");
        await Promise.all([
            infrastructurePage.assertVisibilityKPIGrid(cpuUsageKPI),
            infrastructurePage.assertVisibilityKPIGrid(normalizedLoadKPI),
            infrastructurePage.assertVisibilityKPIGrid(memoryUsageKPI),
            infrastructurePage.assertVisibilityKPIGrid(diskUsageKPI),
            infrastructurePage.assertVisibilityVisualization(cpuUsage), 
            infrastructurePage.assertVisibilityVisualization(normalizedLoad),
            infrastructurePage.assertVisibilityVisualization(memoryUsage), 
            infrastructurePage.assertVisibilityVisualization(rxTx),
            infrastructurePage.assertVisibilityVisualization(diskUsageByMountPoint), 
            infrastructurePage.assertVisibilityVisualization(diskIOReadWrite),
            infrastructurePage.assertVisibilityVisualization(nodeCpuCapacity), 
            infrastructurePage.assertVisibilityVisualization(nodeMemoryCapacity),
        ]).then((values) => {
            console.log(values);
          });
        endTime = performance.now();
    });
    const elapsedTime = endTime - startTime;
    console.log("[Hosts individual page] All visualizations loading time:", elapsedTime);
});