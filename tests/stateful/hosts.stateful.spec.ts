import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { expect } from "@playwright/test";
import { fetchClusterData, getHostData, spaceSelectorStateful, testStep, writeJsonReport } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let resultsContainer: string[] = [`\nTest results:`];
let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Check data', async ({ request }) => {
    logger.info('Checking if host data is available in the last 24 hours');
    const nodesData = await getHostData(request);
    const nodesArr = nodesData.nodes;
    const metricValue = nodesData.nodes[0].metrics[0].value;
    console.log(nodesData.nodes[0].metrics)
    test.skip(nodesArr.length == 0 || metricValue == null, 'Test is skipped: No node data is available');
    logger.info('Fetching cluster data');
    clusterData = await fetchClusterData();
});

test.beforeEach(async ({ headerBar, sideNav, spaceSelector }) => {
    await sideNav.goto();
    logger.info('Selecting the default Kibana space');
    await spaceSelectorStateful(headerBar, spaceSelector);
    await sideNav.clickObservabilitySolutionLink();
});

test.afterEach('Log test results', async ({}, testInfo) => {
    if (testInfo.status == 'passed') {
    logger.info(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
    resultsContainer.push(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
    } else if (testInfo.status == 'failed') {
        logger.error(`Test "${testInfo.title}" failed`);
        resultsContainer.push(`Test "${testInfo.title}" failed`);
    }

    const stepDuration = (testInfo as any).stepDuration;
    const stepStart = (testInfo as any).stepStart;
    const stepEnd = (testInfo as any).stepEnd;
    const hostsMeasurements = (testInfo as any).hostsMeasurements;
    await writeJsonReport(clusterData, testInfo, testStartTime, stepDuration, stepStart, stepEnd, hostsMeasurements);
});

test.afterAll('Log test suite summary', async ({}, testInfo) => {
    if (testInfo.status == 'skipped') {
        logger.warn(`Test "${testInfo.title}" skipped`);
        resultsContainer.push(`Test "${testInfo.title}" skipped`);
        }
    resultsContainer.forEach((result) => {
    console.log(`${result}\n`);
    });
});

test('Hosts - Landing page - All elements', async ({ datePicker, hostsPage, notifications, observabilityPage, page }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "hostsView-metricChart-cpuUsage";
    const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";
    let stepDuration: object[] = [];
    let stepStart: object[] = [];
    let stepEnd: object[] = [];
  
    await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info('Navigating to Hosts page');
        await observabilityPage.clickHosts();
        await hostsPage.setHostsLimit500();
        await datePicker.setPeriod();
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
    (testInfo as any).stepDuration = stepDuration;
    (testInfo as any).stepStart = stepStart;
    (testInfo as any).stepEnd = stepEnd;
});

test('Hosts - Landing page - Logs', async ({ datePicker, hostsPage, observabilityPage, page }, testInfo) => {    
    let stepDuration: object[] = [];
    let stepStart: object[] = [];
    let stepEnd: object[] = [];
    
    await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
        let noLogsData = false;
        logger.info('Navigating to the "Hosts" page');
        await observabilityPage.clickHosts();
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
                logger.warn('Test is skipped due to lack of logs data');
                test.skip(noLogsData, "Test is skipped due to lack of alerts data.")
            })
        ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepDuration = stepDuration;
    (testInfo as any).stepStart = stepStart;
    (testInfo as any).stepEnd = stepEnd;
});

test('Hosts - Landing page - Alerts', async ({ datePicker, hostsPage, observabilityPage, page }, testInfo) => {    
    let stepDuration: object[] = [];
    let stepStart: object[] = [];
    let stepEnd: object[] = [];
    
    await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
        let noAlertsData = false;
        logger.info('Navigating to the "Hosts" page');
        await observabilityPage.clickHosts();
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
                logger.warn('Test is skipped due to lack of alerts data');
                test.skip(noAlertsData, "Test is skipped due to lack of alerts data.")
            })
        ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepDuration = stepDuration;
    (testInfo as any).stepStart = stepStart;
    (testInfo as any).stepEnd = stepEnd;
});

/*
All the individual host tests are not the best fit for the performance comparison purposes since there is no way to filter hosts by uptime.
It would only be suitable in case when hosts in all the environments being compared have collected data within the selected time period. 
*/

test.skip('Hosts - Individual page - All elements', async ({ datePicker, hostsPage, notifications, observabilityPage, page }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";
    let stepDuration: object[] = [];
    let stepStart: object[] = [];
    let stepEnd: object[] = [];

    await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info('Navigating to the "Hosts" page');
        await observabilityPage.clickHosts();
        await page.evaluate("document.body.style.zoom=0.9");
        logger.info('Asserting the visibility of elements on the Hosts page');
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
        logger.info('Clicking on a host in the table');
        await hostsPage.clickTableCellHosts();
    });

    await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        logger.info('Asserting the visibility of elements on the Hosts page');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityVisualization(cpuUsageKPI),
                hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
                hostsPage.assertVisibilityVisualization(memoryUsageKPI),
                hostsPage.assertVisibilityVisualization(diskUsageKPI),
                hostsPage.assertVisibilityVisualization(cpuUsage), 
                hostsPage.assertVisibilityVisualization(normalizedLoad),
                ]),
            notifications.assertErrorFetchingResource().then(() => {
                logger.error('Test is failed due to an error when loading data');
                throw new Error('Test is failed due to an error when loading data');
                })
            ]);
            (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepDuration = stepDuration;
    (testInfo as any).stepStart = stepStart;
    (testInfo as any).stepEnd = stepEnd;
});

test.skip('Hosts - Individual page - Metadata tab', async ({ datePicker, hostsPage, observabilityPage, page }, testInfo) => {
    let stepDuration: object[] = [];
    let stepStart: object[] = [];
    let stepEnd: object[] = [];
    
    await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info('Navigating to the "Hosts" page');
        await observabilityPage.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on a host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Metadata" tab');
        await hostsPage.openHostsMetadataTab();
    });

    await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        await page.reload();
        logger.info('Asserting visibility of the "Metadata" table');
        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityHostsMetadataTable()
            ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepDuration = stepDuration;
    (testInfo as any).stepStart = stepStart;
    (testInfo as any).stepEnd = stepEnd;
});

test.skip('Hosts - Individual page - Metrics tab', async ({ datePicker, hostsPage, notifications, observabilityPage, page }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const cpuUsageBreakdown = "infraAssetDetailsMetricChartcpuUsageBreakdown";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";
    const loadBreakdown = "infraAssetDetailsMetricChartloadBreakdown";
    const memoryUsage = "infraAssetDetailsMetricChartmemoryUsage";
    const memoryUsageBreakdown = "infraAssetDetailsMetricChartmemoryUsageBreakdown";
    let stepDuration: object[] = [];
    let stepStart: object[] = [];
    let stepEnd: object[] = [];

    await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info('Navigating to the "Hosts" page');
        await observabilityPage.clickHosts();
        await page.evaluate("document.body.style.zoom=0.9");
        logger.info('Asserting the visibility of elements on the Hosts page');
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
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Metrics" tab');
        await hostsPage.openHostsMetricsTab();
    });

    await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        logger.info('Asserting visibility of the "Metrics" tab elements');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityVisualizationMetricsTab(cpuUsage),
                hostsPage.assertVisibilityVisualizationMetricsTab(cpuUsageBreakdown),
                hostsPage.assertVisibilityVisualizationMetricsTab(normalizedLoad),
                hostsPage.assertVisibilityVisualizationMetricsTab(loadBreakdown),
                hostsPage.assertVisibilityVisualizationMetricsTab(memoryUsage), 
                hostsPage.assertVisibilityVisualizationMetricsTab(memoryUsageBreakdown), 
                ]),
            notifications.assertErrorFetchingResource().then(() => {
                logger.error('Test is failed due to an error when loading data');
                throw new Error('Test is failed due to an error when loading data');
                })
            ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepDuration = stepDuration;
    (testInfo as any).stepStart = stepStart;
    (testInfo as any).stepEnd = stepEnd;
});

test.skip('Hosts - Individual page - Processes tab', async ({ datePicker, hostsPage, notifications, observabilityPage, page }, testInfo) => {
    let stepDuration: object[] = [];
    let stepStart: object[] = [];
    let stepEnd: object[] = [];
    
    await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info('Navigating to the "Hosts" page');
        await observabilityPage.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Processes" tab');
        await hostsPage.openHostsProcessesTab();
    });

    await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        await page.reload();
        logger.info('Asserting visibility of the "Processes" table');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityHostsProcessesTable()
            ]),
            hostsPage.assertProcessesNotFound().then(() => {
                logger.error('Test failed because no processes found.');
                throw new Error('Test failed because no processes found.');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                logger.error('Test is failed due to an error when loading data');
                throw new Error('Test is failed due to an error when loading data');
            })
          ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepDuration = stepDuration;
    (testInfo as any).stepStart = stepStart;
    (testInfo as any).stepEnd = stepEnd;
});

test.skip('Hosts - Individual page - Profiling tab', async ({ datePicker, hostsPage, notifications, observabilityPage, page }, testInfo) => {
    let stepDuration: object[] = [];
    let stepStart: object[] = [];
    let stepEnd: object[] = [];
    
    await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info('Navigating to the "Hosts" page');
        await observabilityPage.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Asserting visibility of the "Metrics" tab');
        await expect(hostsPage.hostsMetricsTab()).toBeVisible();
        logger.info('Navigating to the "Profiling" tab');
        const profilingTabVisibility = await hostsPage.hostsProfilingTab().isVisible();
        test.skip(!profilingTabVisibility, 'Skipping test due to absence of Profiling tab');
        await hostsPage.openHostsProfilingTab();
    });

    await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
        await datePicker.assertVisibilityDatePickerHostsProfiling();
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriodProfiling();
        logger.info('Asserting visibility of the profiling flamegraph');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityProfilingFlamegraph()
            ]),
            hostsPage.assertAddProfilingButton().then(() => {
                logger.error('Test failed because profiling is not set up');
                throw new Error('Test failed because profiling is not set up');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                logger.error('Test is failed due to an error when loading data');
                throw new Error('Test is failed due to an error when loading data');
            })
          ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepDuration = stepDuration;
    (testInfo as any).stepStart = stepStart;
    (testInfo as any).stepEnd = stepEnd;
});

test.skip('Hosts - Individual page - Logs tab', async ({ datePicker, hostsPage, notifications, observabilityPage, page }, testInfo) => {
    let stepDuration: object[] = [];
    let stepStart: object[] = [];
    let stepEnd: object[] = [];
    
    await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info('Navigating to the "Hosts" page');
        await observabilityPage.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Logs" tab');
        await hostsPage.openHostsLogsTab();
    });

    await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        logger.info('Asserting visibility of the "Logs" stream');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityHostsLogsTabStream()
            ]),
            hostsPage.assertLogsNotFound().then(() => {
                logger.error('Test failed because no logs found');
                throw new Error('Test failed because no logs found');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                logger.error('Test is failed due to an error when loading data');
                throw new Error('Test is failed due to an error when loading data');
              })
          ]);
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepDuration = stepDuration;
    (testInfo as any).stepStart = stepStart;
    (testInfo as any).stepEnd = stepEnd;
});