import { test } from '../../src/pom/page.fixtures.ts';
import {
    fetchClusterData,
    getDatePickerLogMessage,
    getDocCount,
    getHostData,
    printResults,
    selectDefaultSpace,
    testStep,
    writeJsonReport
} from "../../src/helpers.ts";

let clusterData: any;
let doc_count: object;
let reports: string[] = [];
const testStartTime: string = new Date().toISOString();

test.beforeAll('Check data', async ({ request, log }) => {
    log.info('Checking if host data is available in the last 24 hours');
    const nodesData = await getHostData(request);
    const nodesArr = nodesData.nodes;
    const metricValue = nodesData.nodes[0].metrics[0].value;
    test.skip(nodesArr.length == 0 || metricValue == null, 'Test is skipped: No node data is available');
    log.info('Fetching cluster data');
    clusterData = await fetchClusterData();
    doc_count = await getDocCount();
});

test.beforeEach(async ({ page, sideNav, log }) => {
    await sideNav.goto();
    log.info('Selecting the default Kibana space');
    await selectDefaultSpace(clusterData.version.build_flavor, page);
});

test.afterEach('Log test results', async ({ log }, testInfo) => {
    const stepData = (testInfo as any).stepData;
    const reportFiles = await writeJsonReport(log, clusterData, testInfo, testStartTime, doc_count, stepData);
    reports.push(...reportFiles.filter(item => typeof item === 'string'));
});

test.afterAll('Print test results', async ({ }) => {
    await printResults(reports);
});

test('Hosts - Landing page - All elements', async ({ datePicker, headerBar, hostsPage, notifications, page, log }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "hostsView-metricChart-cpuUsage";
    const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";
    let stepData: object[] = [];
    (testInfo as any).stepData = stepData;

    await testStep('step01', stepData, page, async () => {
        log.info('Navigating to the "Hosts" section');
        await page.goto('/app/metrics/hosts');
        await hostsPage.setHostsLimit500();
        log.info(`${getDatePickerLogMessage()}`);
        await datePicker.setInterval();
        await page.evaluate("document.body.style.zoom=0.9");
        log.info('Asserting visibility of elements on the Hosts page');
        await Promise.race([
            Promise.all([
                hostsPage.assertHostsNumber(),
                hostsPage.assertVisibilityHostsTable(),
                hostsPage.assertVisibilityVisualization(cpuUsageKPI),
                hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
                hostsPage.assertVisibilityVisualization(memoryUsageKPI),
                hostsPage.assertVisibilityVisualization(diskUsageKPI),
                hostsPage.assertVisibilityVisualization(cpuUsage),
                hostsPage.assertVisibilityVisualization(normalizedLoad),
                headerBar.assertLoadingIndicator(),
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
    }, 'Asserting visibility of visualizations on the Hosts landing page');
});

test('Hosts - Landing page - Logs', async ({ datePicker, headerBar, hostsPage, page, log }, testInfo) => {
    let stepData: object[] = [];
    (testInfo as any).stepData = stepData;

    await testStep('step01', stepData, page, async () => {
        let noLogsData = false;
        log.info('Navigating to the "Hosts" section');
        await page.goto('/app/metrics/hosts');
        await hostsPage.setHostsLimit500();
        log.info(`${getDatePickerLogMessage()}`);
        await datePicker.setInterval();
        log.info('Navigating to the "Logs" tab');
        await hostsPage.clickLogsTab();
        log.info('Asserting number of host logs...');
        await Promise.race([
            Promise.all([
                hostsPage.assertLogsDocNumber(),
                hostsPage.assertDocTable(),
                headerBar.assertLoadingIndicator(),
            ]),
            hostsPage.assertVisibilityNoLogs().then(() => {
                noLogsData = true;
                log.warn('Test is skipped due to lacking host logs data');
                test.skip(noLogsData, "Test is skipped due to lacking host logs data")
            })
        ]);
    }, 'Asserting the number of logs documents on the Hosts landing page');
});

test('Hosts - Landing page - Alerts', async ({ datePicker, headerBar, hostsPage, page, log }, testInfo) => {
    let stepData: object[] = [];
    (testInfo as any).stepData = stepData;

    await testStep('step01', stepData, page, async () => {
        let noAlertsData = false;
        log.info('Navigating to the "Hosts" section');
        await page.goto('/app/metrics/hosts');
        await hostsPage.setHostsLimit500();
        log.info(`${getDatePickerLogMessage()}`);
        await datePicker.setInterval();
        log.info('Navigating to the "Alerts" tab');
        await hostsPage.clickAlertsTab();
        log.info('Asserting visibility of the "Alerts" chart and table');
        await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityAlertsChart(),
                hostsPage.assertVisibilityAlertsTable(),
                headerBar.assertLoadingIndicator(),
            ]),
            hostsPage.assertNoResultsMatchMessage().then(() => {
                noAlertsData = true;
                log.warn('Test is skipped due to lacking host alerts data')
                test.skip(noAlertsData, "Test is skipped due to lacking host alerts data")
            })
        ]);
    }, 'Asserting visibility of the alerts chart and table on the Hosts landing page');
});