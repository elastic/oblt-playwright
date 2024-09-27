import { test } from '../fixtures/serverless/basePage';
import { expect } from "@playwright/test";
import { waitForOneOf } from "../../src/types.ts";

const apiKey = process.env.API_KEY;
const outputDirectory = process.env.HOSTS_DIR;
const fs = require('fs');
const path = require('path');
let versionNumber: string;
let cluster_name: string;
let cluster_uuid: string;
let build_hash: string;

function writeFileReport(testStartTime, testInfo, asyncResults) {
    const resultsObj = asyncResults.reduce((acc, obj) => {
        return { ...acc, ...obj };
    }, {});
    const fileName = `${new Date(testStartTime).toISOString().replace(/:/g, '_')}.json`;
    const outputPath = path.join(outputDirectory, fileName);
    const reportData = {
        name: testInfo.title,
        deployment: "serverless",
        cluster_name: cluster_name,
        cluster_uuid: cluster_uuid,
        version: versionNumber,
        build_hash: build_hash,
        date: testStartTime,
        time_window: `Last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`,
        measurements: resultsObj
        };        
    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
    };

test.beforeAll('Check data', async ({ request }) => {
    let a = await request.get(`${process.env.ELASTICSEARCH_HOST}`, {
        headers: {
            "accept": "*/*",
            "Authorization": apiKey,
            "kbn-xsrf": "reporting",
            }
        }
    )
    expect(a.status()).toBe(200);
    const jsonDataCluster = JSON.parse(await a.text());
    versionNumber = jsonDataCluster.version.number;
    cluster_name = jsonDataCluster.cluster_name;
    cluster_uuid = jsonDataCluster.cluster_uuid;
    build_hash = jsonDataCluster.version.build_hash;

    console.log(`... checking node data.`);
    const currentTime = Date.now();
    const rangeTime = currentTime - 1200000;

    let b = await request.post('api/metrics/snapshot', {
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
    });
    expect(b.status()).toBe(200);
    const jsonDataNode = JSON.parse(await b.text());
    const nodesArr = jsonDataNode.nodes;
    expect(nodesArr, 'The number of available nodes in the Inventory should not be less than 1.').not.toHaveLength(0);
    if (b.status() == 200) {
        console.log(`✓ Node data is checked.`);
    }
});

test.beforeEach(async ({ landingPage, page }) => {
    await landingPage.goto();
    const [ index ] = await waitForOneOf([
        page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]'),
        landingPage.spaceSelector(),
        ]);
      const spaceSelector = index === 1;
      if (spaceSelector) {
        await page.locator('xpath=//a[contains(text(),"Default")]').click();
        await expect(page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]')).toBeVisible();
        };
    await landingPage.clickInfrastructure();
    await landingPage.clickHosts();
});

test('Hosts - Landing page', async ({ datePicker, hostsPage }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "hostsView-metricChart-cpuUsage";
    const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";
  
    await test.step('step01', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 01 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await hostsPage.setHostsLimit500();
        await datePicker.setPeriod();

        const asyncResults = await Promise.all([
            hostsPage.assertHostsNumber(),
            hostsPage.assertVisibilityHostsTable(),
            hostsPage.assertVisibilityVisualization(cpuUsageKPI),
            hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
            hostsPage.assertVisibilityVisualization(memoryUsageKPI),
            hostsPage.assertVisibilityVisualization(diskUsageKPI),
            hostsPage.assertVisibilityVisualization(cpuUsage), 
            hostsPage.assertVisibilityVisualization(normalizedLoad),
            ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Landing page - Logs', async ({ datePicker, hostsPage }, testInfo) => {    
    await test.step('step01', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 01 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await hostsPage.setHostsLimit500();
        await datePicker.setPeriod();
        await hostsPage.clickLogsTab();

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityLogStream()
            ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Landing page - Alerts', async ({ datePicker, hostsPage }, testInfo) => {    
    await test.step('step01', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 01 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await hostsPage.setHostsLimit500();
        await datePicker.setPeriod();
        await hostsPage.clickAlertsTab();

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityAlertsChart(),
            hostsPage.assertVisibilityAlertsTable()
            ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Individual page', async ({ datePicker, hostsPage }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";

    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to individual host page.`);
        await hostsPage.clickTableCellHosts();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.setPeriod();

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityVisualization(cpuUsageKPI),
            hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
            hostsPage.assertVisibilityVisualization(memoryUsageKPI),
            hostsPage.assertVisibilityVisualization(diskUsageKPI),
            hostsPage.assertVisibilityVisualization(cpuUsage), 
            hostsPage.assertVisibilityVisualization(normalizedLoad),
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
        await datePicker.setPeriod();
        await page.reload();

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityHostsMetadataTable()
            ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Individual page - Metrics tab', async ({ datePicker, hostsPage }, testInfo) => {
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const cpuUsageBreakdown = "infraAssetDetailsMetricChartcpuUsageBreakdown";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";
    const loadBreakdown = "infraAssetDetailsMetricChartloadBreakdown";
    const memoryUsage = "infraAssetDetailsMetricChartmemoryUsage";
    const memoryUsageBreakdown = "infraAssetDetailsMetricChartmemoryUsageBreakdown";

    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Metrics tab.`);
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsMetricsTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.setPeriod();

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityVisualizationMetricsTab(cpuUsage),
            hostsPage.assertVisibilityVisualizationMetricsTab(cpuUsageBreakdown),
            hostsPage.assertVisibilityVisualizationMetricsTab(normalizedLoad),
            hostsPage.assertVisibilityVisualizationMetricsTab(loadBreakdown),
            hostsPage.assertVisibilityVisualizationMetricsTab(memoryUsage), 
            hostsPage.assertVisibilityVisualizationMetricsTab(memoryUsageBreakdown), 
            ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Individual page - Processes tab', async ({ datePicker, hostsPage, page }, testInfo) => {
    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Processes tab.`);
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsProcessesTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.setPeriod();
        await page.reload();

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityHostsProcessesTable()
            ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});

test('Hosts - Individual page - Logs tab', async ({ datePicker, hostsPage }, testInfo) => {
    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Logs tab.`);
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsLogsTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.setPeriod();

        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityHostsLogsTabStream()
            ]);
        writeFileReport(testStartTime, testInfo, asyncResults);
    });
});