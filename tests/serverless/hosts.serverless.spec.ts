import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { getHostData, spaceSelectorServerless, writeFileReportHosts } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let resultsContainer: string[] = [`\nTest results:`];

test.beforeAll('Check data', async ({ request }) => {
    logger.info('Checking if Hosts data is available');
    const nodesData = await getHostData(request);
    const nodesArr = nodesData.nodes;
    const metricValue = nodesData.nodes[0].metrics[0].value;
    test.skip(nodesArr.length == 0 || metricValue == null, 'Test is skipped: No node data is available');
});

test.beforeEach(async ({ sideNav, spaceSelector }) => {
    await sideNav.goto();
    logger.info('Selecting the default Kibana space')
    await spaceSelectorServerless(sideNav, spaceSelector);
    await sideNav.clickInfrastructure();
});

test.afterEach('Log test results', async ({}, testInfo) => {
  if (test.info().status == 'passed') {
    logger.info(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
    resultsContainer.push(`Test "${testInfo.title}" completed in ${testInfo.duration} ms`);
  } else if (test.info().status == 'failed') {
    logger.error(`Test "${testInfo.title}" failed`);
    resultsContainer.push(`Test "${testInfo.title}" failed`);
  }
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

test('Hosts - Landing page - All elements', async ({ datePicker, hostsPage, sideNav, notifications, page, request }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "hostsView-metricChart-cpuUsage";
    const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";
  
    await test.step('step01', async () => {
        const testStartTime = Date.now();
        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
        await hostsPage.setHostsLimit500();
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
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
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test('Hosts - Landing page - Logs', async ({ datePicker, hostsPage, sideNav, request }, testInfo) => {    
    await test.step('step01', async () => {
        let noLogsData = false;
        const testStartTime = Date.now();
        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
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
                test.skip(noLogsData, "Test is skipped due to lack of logs data")
            })
        ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test('Hosts - Landing page - Alerts', async ({ datePicker, hostsPage, sideNav, request }, testInfo) => {    
    await test.step('step01', async () => {
        let noAlertsData = false;
        const testStartTime = Date.now();
        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
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
                test.skip(noAlertsData, "Test is skipped due to lack of alerts data")
            })
        ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

/*
All the individual host tests are not the best fit for the performance comparison purposes since there is no way to filter hosts by uptime.
It would only be suitable in case when hosts in all the environments being compared have collected data within the selected time period. 
*/

test.skip('Hosts - Individual page - All elements', async ({ datePicker, hostsPage, sideNav, notifications, page, request }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";``
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";

    await test.step('step01', async () => {
        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
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
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
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
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test.skip('Hosts - Individual page - Metadata tab', async ({ datePicker, hostsPage, sideNav, page, request }, testInfo) => {
    await test.step('step01', async () => {
        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Metadata" tab');
        await hostsPage.openHostsMetadataTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        await page.reload();
        logger.info('Asserting visibility of the "Metadata" table');
        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityHostsMetadataTable()
            ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test.skip('Hosts - Individual page - Metrics tab', async ({ datePicker, hostsPage, sideNav, notifications, page, request }, testInfo) => {
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

    await test.step('step01', async () => {
        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
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

    await test.step('step02', async () => {
        const testStartTime = Date.now();
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
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test.skip('Hosts - Individual page - Processes tab', async ({ datePicker, hostsPage, sideNav, notifications, page, request }, testInfo) => {
    await test.step('step01', async () => {
        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Processes" tab');
        await hostsPage.openHostsProcessesTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        await page.reload();
        logger.info('Asserting visibility of the "Processes" table');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityHostsProcessesTable()
            ]),
            hostsPage.assertProcessesNotFound().then(() => {
                logger.error('Test failed because no processes found');
                throw new Error('Test failed because no processes found');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                logger.error('Test is failed due to an error when loading data');
                throw new Error('Test is failed due to an error when loading data');
              })
          ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test.skip('Hosts - Individual page - Logs tab', async ({ datePicker, hostsPage, sideNav, notifications, request }, testInfo) => {
    await test.step('step01', async () => {
        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Logs" tab');
        await hostsPage.openHostsLogsTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
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
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});