import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { fetchClusterData, getHostData, spaceSelectorServerless, writeJsonReport } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let resultsContainer: string[] = [`\nTest results:`];
let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Check data', async ({ request }) => {
    logger.info('Checking if Hosts data is available');
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

  const stepsData = (testInfo as any).stepsData;
  const hostsMeasurements = (testInfo as any).hostsMeasurements;
  await writeJsonReport(clusterData, testInfo, testStartTime, stepsData, hostsMeasurements);
});

test.afterAll('Log test suite summary', async ({}, testInfo) => {
  if (testInfo.status == 'skipped') {
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
    let steps: object[] = [];
  
    await test.step('step01', async () => {
        const stepStartTime = performance.now();

        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
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
        
        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step01": stepDuration});
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepsData = steps;
});

test('Hosts - Landing page - Logs', async ({ datePicker, hostsPage, sideNav, request }, testInfo) => {  
    let steps: object[] = [];

    await test.step('step01', async () => {
        const stepStartTime = performance.now();

        let noLogsData = false;
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
                test.skip(noLogsData, "Test is skipped due to lack of logs data")
            })
        ]);
        
        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step01": stepDuration});
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepsData = steps;
});

test('Hosts - Landing page - Alerts', async ({ datePicker, hostsPage, sideNav, request }, testInfo) => {
    let steps: object[] = [];

    await test.step('step01', async () => {
        const stepStartTime = performance.now();

        let noAlertsData = false;
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
                test.skip(noAlertsData, "Test is skipped due to lack of alerts data")
            })
        ]);

        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step01": stepDuration});
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepsData = steps;
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
    let steps: object[] = [];

    await test.step('step01', async () => {
        const stepStartTime = performance.now();

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
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();

        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step01": stepDuration});
    });

    await test.step('step02', async () => {
        const stepStartTime = performance.now();

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
                throw new Error('Test is failed due to an error when loading data');
                })
            ]);
        
        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step02": stepDuration});
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepsData = steps;
});

test.skip('Hosts - Individual page - Metadata tab', async ({ datePicker, hostsPage, sideNav, page, request }, testInfo) => {
    let steps: object[] = [];

    await test.step('step01', async () => {
        const stepStartTime = performance.now();

        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Metadata" tab');
        await hostsPage.openHostsMetadataTab();

        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step01": stepDuration});
    });

    await test.step('step02', async () => {
        const stepStartTime = performance.now();

        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        await page.reload();
        logger.info('Asserting visibility of the "Metadata" table');
        const asyncResults = await Promise.all([
            hostsPage.assertVisibilityHostsMetadataTable()
            ]);
        
        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step02": stepDuration});
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepsData = steps;
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
    let steps: object[] = [];

    await test.step('step01', async () => {
        const stepStartTime = performance.now();

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
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Metrics" tab');
        await hostsPage.openHostsMetricsTab();

        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step02": stepDuration});
    });

    await test.step('step02', async () => {
        const stepStartTime = performance.now();

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
                throw new Error('Test is failed due to an error when loading data');
                })
            ]);
        
        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step02": stepDuration});
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepsData = steps;
});

test.skip('Hosts - Individual page - Processes tab', async ({ datePicker, hostsPage, sideNav, notifications, page, request }, testInfo) => {
    let steps: object[] = [];

    await test.step('step01', async () => {
        const stepStartTime = performance.now();

        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Processes" tab');
        await hostsPage.openHostsProcessesTab();

        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step01": stepDuration});
    });

    await test.step('step02', async () => {
        const stepStartTime = performance.now();

        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        await page.reload();
        logger.info('Asserting visibility of the "Processes" table');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityHostsProcessesTable()
            ]),
            hostsPage.assertProcessesNotFound().then(() => {
                throw new Error('Test failed because no processes found');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                throw new Error('Test is failed due to an error when loading data');
              })
          ]);
        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step02": stepDuration});
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepsData = steps;
});

test.skip('Hosts - Individual page - Logs tab', async ({ datePicker, hostsPage, sideNav, notifications, request }, testInfo) => {
    let steps: object[] = [];

    await test.step('step01', async () => {
        const stepStartTime = performance.now();

        logger.info('Navigating to the "Hosts" section');
        await sideNav.clickHosts();
        logger.info('Asserting visibility of the "Hosts" table');
        await hostsPage.assertVisibilityHostsTable(),
        logger.info('Clicking on the first host in the table');
        await hostsPage.clickTableCellHosts();
        logger.info('Navigating to the "Logs" tab');
        await hostsPage.openHostsLogsTab();

        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step01": stepDuration});
    });

    await test.step('step02', async () => {
        const stepStartTime = performance.now();

        logger.info(`Setting the search period of last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`);
        await datePicker.setPeriod();
        logger.info('Asserting visibility of the "Logs" stream');
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityHostsLogsTabStream()
            ]),
            hostsPage.assertLogsNotFound().then(() => {
                throw new Error('Test failed because no logs found');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                throw new Error('Test is failed due to an error when loading data');
              })
          ]);

        const stepDuration = performance.now() - stepStartTime;
        steps.push({"step02": stepDuration});
        (testInfo as any).hostsMeasurements = asyncResults;
    });
    (testInfo as any).stepsData = steps;
});