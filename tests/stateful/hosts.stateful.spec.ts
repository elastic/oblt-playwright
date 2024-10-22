import { test } from '../fixtures/stateful/basePage';
import { expect } from "@playwright/test";
import { checkHostData, spaceSelectorStateful, writeFileReportHosts } from "../../src/helpers.ts";

test.beforeAll('Check data', async ({ request }) => {
    await checkHostData(request);
});

test.beforeEach(async ({ headerBar, sideNav, spaceSelector }) => {
    await sideNav.goto();
    await spaceSelectorStateful(headerBar, spaceSelector);
    await sideNav.clickObservabilitySolutionLink();
});

test('Hosts - Landing page - All elements', async ({ datePicker, hostsPage, notifications, observabilityPage, page, request }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "hostsView-metricChart-cpuUsage";
    const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";
  
    await test.step('step01', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 01 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await observabilityPage.clickHosts();
        await hostsPage.setHostsLimit500();
        await datePicker.setPeriod();
        await page.evaluate("document.body.style.zoom=0.9");
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
                throw new Error('Test is failed because Hosts data failed to load.');
            })
        ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test('Hosts - Landing page - Logs', async ({ datePicker, hostsPage, observabilityPage, request }, testInfo) => {    
    await test.step('step01', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 01 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await observabilityPage.clickHosts();
        await hostsPage.setHostsLimit500();
        await datePicker.setPeriod();
        await hostsPage.clickLogsTab();
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityLogStream()
                ]),
            hostsPage.assertVisibilityNoLogs().then(() => {
                throw new Error('Test is failed because no logs found.');
            })
        ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test('Hosts - Landing page - Alerts', async ({ datePicker, hostsPage, observabilityPage, request }, testInfo) => {    
    await test.step('step01', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 01 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await observabilityPage.clickHosts();
        await hostsPage.setHostsLimit500();
        await datePicker.setPeriod();
        await hostsPage.clickAlertsTab();
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityAlertsChart(),
                hostsPage.assertVisibilityAlertsTable()
                ]),
            hostsPage.assertNoResultsMatchMessage().then(() => {
                throw new Error('Test is failed because no alerts found.');
            })
        ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

/*
All the individual host tests are not the best fit for the performance comparison purposes since there is no way to filter hosts by uptime.
It would only be suitable in case when hosts in all the environments being compared have collected data within the selected time period. 
*/

test('Hosts - Individual page - All elements', async ({ datePicker, hostsPage, notifications, observabilityPage, page, request }, testInfo) => {
    const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
    const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
    const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
    const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
    const cpuUsage = "infraAssetDetailsMetricChartcpuUsage";
    const normalizedLoad = "infraAssetDetailsMetricChartnormalizedLoad1m";

    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to individual host page.`);
        await observabilityPage.clickHosts();
        await page.evaluate("document.body.style.zoom=0.9");
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
                throw new Error('Test is failed because Hosts data failed to load.');
            })
        ]);
        await hostsPage.clickTableCellHosts();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.setPeriod();
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
                throw new Error('Test is failed due to an error when loading data.');
                })
            ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test('Hosts - Individual page - Metadata tab', async ({ datePicker, hostsPage, observabilityPage, page, request }, testInfo) => {
    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Metadata tab.`);
        await observabilityPage.clickHosts();
        await hostsPage.assertVisibilityHostsTable(),
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
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test('Hosts - Individual page - Metrics tab', async ({ datePicker, hostsPage, notifications, observabilityPage, page, request }, testInfo) => {
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
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Metrics tab.`);
        await observabilityPage.clickHosts();
        await page.evaluate("document.body.style.zoom=0.9");
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
                throw new Error('Test is failed because Hosts data failed to load.');
            })
        ]);
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsMetricsTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.setPeriod();
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
                throw new Error('Test is failed due to an error when loading data.');
                })
            ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test('Hosts - Individual page - Processes tab', async ({ datePicker, hostsPage, notifications, observabilityPage, page, request }, testInfo) => {
    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Processes tab.`);
        await observabilityPage.clickHosts();
        await hostsPage.assertVisibilityHostsTable(),
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsProcessesTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.setPeriod();
        await page.reload();
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityHostsProcessesTable()
            ]),
            hostsPage.assertProcessesNotFound().then(() => {
                throw new Error('Test failed because no processes found.');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                throw new Error('Test is failed due to an error when loading data.');
            })
          ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test('Hosts - Individual page - Profiling tab', async ({ datePicker, hostsPage, notifications, observabilityPage, request }, testInfo) => {
    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Profiling tab.`);
        await observabilityPage.clickHosts();
        await hostsPage.assertVisibilityHostsTable(),
        await hostsPage.clickTableCellHosts();
        await expect(hostsPage.hostsMetricsTab()).toBeVisible();
        const profilingTabVisibility = await hostsPage.hostsProfilingTab().isVisible();
        test.skip(!profilingTabVisibility, 'Skipping test due to absence of Profiling tab');
        await hostsPage.openHostsProfilingTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.assertVisibilityDatePickerHostsProfiling();
        await datePicker.setPeriodProfiling();
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityProfilingFlamegraph()
            ]),
            hostsPage.assertAddProfilingButton().then(() => {
                throw new Error('Test failed because profiling is not set up.');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                throw new Error('Test is failed due to an error when loading data.');
            })
          ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});

test('Hosts - Individual page - Logs tab', async ({ datePicker, hostsPage, notifications, observabilityPage, request }, testInfo) => {
    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Logs tab.`);
        await observabilityPage.clickHosts();
        await hostsPage.assertVisibilityHostsTable(),
        await hostsPage.clickTableCellHosts();
        await hostsPage.openHostsLogsTab();
    });

    await test.step('step02', async () => {
        const testStartTime = Date.now();
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts the loading time of elements.`);
        await datePicker.setPeriod();
        const asyncResults = await Promise.race([
            Promise.all([
                hostsPage.assertVisibilityHostsLogsTabStream()
            ]),
            hostsPage.assertLogsNotFound().then(() => {
                throw new Error('Test failed because no logs found.');
            }),
            notifications.assertErrorFetchingResource().then(() => {
                throw new Error('Test is failed due to an error when loading data.');
              })
          ]);
        await writeFileReportHosts(asyncResults, request, testInfo, testStartTime);
    });
});