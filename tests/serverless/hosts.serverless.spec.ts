import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { fetchClusterData, getHostData, spaceSelectorServerless, testStep, writeJsonReport } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Check data', async ({ request }) => {
    logger.info('Checking if host data is available in the last 24 hours');
    const nodesData = await getHostData(request);
    const nodesArr = nodesData.nodes;
    const metricValue = nodesData.nodes[0].metrics[0].value;
    test.skip(nodesArr.length == 0 || metricValue == null, 'Test is skipped: No node data is available');
    logger.info('Fetching cluster data');
    clusterData = await fetchClusterData();
});

test.beforeEach(async ({ sideNav, spaceSelector }) => {
    await sideNav.goto();
    logger.info('Selecting the default Kibana space')
    await spaceSelectorServerless(sideNav, spaceSelector);
});

test.afterEach('Log test results', async ({}, testInfo) => {
  const hostsMeasurements = (testInfo as any).hostsMeasurements;
  const stepData = (testInfo as any).stepData;
  await writeJsonReport(clusterData, testInfo, testStartTime, stepData, hostsMeasurements);
});

test('Hosts - Landing page - All elements', async ({ datePicker, hostsPage, notifications, page }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "hostsView-metricChart-cpuUsage";
    const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";
    let stepData: object[] = [];
  
    await testStep('step01', stepData, page, async () => {
        logger.info('Navigating to the "Hosts" section');
        await page.goto('/app/metrics/hosts');
        await hostsPage.setHostsLimit500();
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        await page.evaluate("document.body.style.zoom=0.9");
        logger.info('Asserting visibility of elements on the Hosts page');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertHostsNumber(),
                hostsPage.assertVisibilityHostsTable(),
                hostsPage.assertVisibilityVisualization(cpuUsageKPI),
                hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
                hostsPage.assertVisibilityVisualization(memoryUsageKPI),
                hostsPage.assertVisibilityVisualization(diskUsageKPI),
                hostsPage.assertVisibilityVisualization(cpuUsage), 
                hostsPage.assertVisibilityVisualization(normalizedLoad),
                ]),
            hostsPage.assertVisualizationNoData(cpuUsageKPI).then(() => {
                throw new Error('Test is failed because no visualization data available');
            }),
            hostsPage.assertVisualizationNoData(normalizedLoadKPI).then(() => {
                throw new Error('Test is failed because no visualization data available');
            }),
            hostsPage.assertVisualizationNoData(memoryUsageKPI).then(() => {
                throw new Error('Test is failed because no visualization data available');
            }),
            hostsPage.assertVisualizationNoData(diskUsageKPI).then(() => {
                throw new Error('Test is failed because no visualization data available');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                throw new Error('Test is failed because Hosts data failed to load');
            })
        ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepData = stepData;
});

test('Hosts - Landing page - Logs', async ({ datePicker, hostsPage, page}, testInfo) => {  
    let stepData: object[] = [];

    await testStep('step01', stepData, page, async () => {
        let noLogsData = false;
        logger.info('Navigating to the "Hosts" section');
        await page.goto('/app/metrics/hosts');
        await hostsPage.setHostsLimit500();
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        logger.info('Navigating to the "Logs" tab');
        await hostsPage.clickLogsTab();
        logger.info('Asserting visibility of the "Logs" stream');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityLogStream()
                ]),
            hostsPage.assertVisibilityNoLogs().then(() => {
                noLogsData = true;
                test.skip(noLogsData, "Test is skipped due to lack of logs data")
            })
        ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepData = stepData;
});

test('Hosts - Landing page - Alerts', async ({ datePicker, hostsPage, page }, testInfo) => {
    let stepData: object[] = [];

    await testStep('step01', stepData, page, async () => {
        let noAlertsData = false;
        logger.info('Navigating to the "Hosts" section');
        await page.goto('/app/metrics/hosts');
        await hostsPage.setHostsLimit500();
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        logger.info('Navigating to the "Alerts" tab');
        await hostsPage.clickAlertsTab();
        logger.info('Asserting visibility of the "Alerts" chart and table');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityAlertsChart(),
                hostsPage.assertVisibilityAlertsTable()
                ]),
            hostsPage.assertNoResultsMatchMessage().then(() => {
                noAlertsData = true;
                test.skip(noAlertsData, "Test is skipped due to lack of alerts data")
            })
        ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepData = stepData;
});