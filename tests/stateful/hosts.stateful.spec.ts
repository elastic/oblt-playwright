import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { fetchClusterData, getDatePickerLogMessageStateful, getHostData, spaceSelectorStateful, testStep, writeJsonReport } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';
import { TIME_UNIT, TIME_VALUE } from '../../src/env.ts';

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

test.beforeEach(async ({ headerBar, sideNav, spaceSelector }) => {
    await sideNav.goto();
    logger.info('Selecting the default Kibana space');
    await spaceSelectorStateful(headerBar, spaceSelector);
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
        logger.info('Navigating to Hosts page');
        await page.goto('/app/metrics/hosts');
        await hostsPage.setHostsLimit500();
        await datePicker.setInterval();
        await page.evaluate("document.body.style.zoom=0.9");
        logger.info('Asserting the visibility of elements on the Hosts page');
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
                logger.error(`Test is failed because "${cpuUsageKPI}" visualization data is not available`);
                throw new Error('Test is failed because no visualization data available');
            }),
            hostsPage.assertVisualizationNoData(normalizedLoadKPI).then(() => {
                logger.error(`Test is failed because "${normalizedLoadKPI}" visualization data is not available`);
                throw new Error('Test is failed because no visualization data available');
            }),
            hostsPage.assertVisualizationNoData(memoryUsageKPI).then(() => {
                logger.error(`Test is failed because "${memoryUsageKPI}" visualization data is not available`);
                throw new Error('Test is failed because no visualization data available');
            }),
            hostsPage.assertVisualizationNoData(diskUsageKPI).then(() => {
                logger.error(`Test is failed because "${diskUsageKPI}" visualization data is not available`);
                throw new Error('Test is failed because no visualization data available');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                logger.error('Test is failed because Hosts data failed to load');
                throw new Error('Test is failed because Hosts data failed to load');
            })
        ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepData = stepData;
});

test('Hosts - Landing page - Logs', async ({ datePicker, hostsPage, page }, testInfo) => {    
    let stepData: object[] = [];
    
    await testStep('step01', stepData, page, async () => {
        let noLogsData = false;
        logger.info('Navigating to the "Hosts" page');
        await page.goto('/app/metrics/hosts');
        await hostsPage.setHostsLimit500();
        logger.info(`${getDatePickerLogMessageStateful()}`);
        await datePicker.setInterval();
        logger.info('Navigating to the "Logs" tab');
        await hostsPage.clickLogsTab();
        logger.info('Asserting visibility of the "Logs" stream');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityLogStream()
                ]),
            hostsPage.assertVisibilityNoLogs().then(() => {
                noLogsData = true;
                logger.warn('Test is skipped due to lack of logs data');
                test.skip(noLogsData, "Test is skipped due to lack of alerts data.")
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
        logger.info('Navigating to the "Hosts" page');
        await page.goto('/app/metrics/hosts');
        await hostsPage.setHostsLimit500();
        logger.info(`${getDatePickerLogMessageStateful()}`);
        await datePicker.setInterval();
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
                logger.warn('Test is skipped due to lack of alerts data');
                test.skip(noAlertsData, "Test is skipped due to lack of alerts data.")
            })
        ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepData = stepData;
});