import { test } from '../../src/pom/page.fixtures.ts';
import { expect, Page } from "@playwright/test";
import { 
  fetchClusterData, 
  getDatePickerLogMessage,
  getDocCount,
  getPodData, 
  importDashboards,
  printResults,
  selectDefaultSpace, 
  testStep, 
  writeJsonReport 
 } from "../../src/helpers.ts";
import { logger } from '../../src/logger.ts';

let clusterData: any;
let doc_count: object;
let reports: string[] = [];
const testStartTime: string = new Date().toISOString();

test.beforeAll('Check pod data', async ({ browser, request }) => {
  logger.info('Checking if pod data is available in the last 24 hours');
  const podsData = await getPodData(request);
  const podsArr = podsData.nodes;
  test.skip(podsArr.length == 0, 'Test is skipped: No pod data is available');
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
  doc_count = await getDocCount();
  await importDashboards(browser, 'src/data/dashboards/dashboards.ndjson');
});

test.beforeEach(async ({ page, sideNav, spaceSelector }) => {
  await sideNav.goto();
  logger.info('Selecting the default Kibana space');
  await selectDefaultSpace(clusterData.version.build_flavor, page);
});

test.afterEach('Log test results', async ({}, testInfo) => {
  const stepData = (testInfo as any).stepData;
  const reportFiles = await writeJsonReport(clusterData, testInfo, testStartTime, doc_count, stepData);
  reports.push(...reportFiles.filter(item => typeof item === 'string'));
});

test.afterAll('Print test results', async ({}) => {
  await printResults(reports);
});

test.skip('Infrastructure - Cluster Overview dashboard', async ({ dashboardPage, datePicker, headerBar, sideNav, notifications, page }, testInfo) => {
  const coresUsedVsTotal = "Cores used vs total cores";
  const topMemoryIntensivePods = "Top Memory intensive pods per Node";
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info('Navigating to Dashboards');
    await sideNav.clickDashboards();
    await dashboardPage.assertVisibilityHeading();
    await dashboardPage.assertVisibilityTable();
    logger.info('Searching for the "Cluster Overview" dashboard');
    await dashboardPage.searchDashboard('Cluster Overview');
    await Promise.race([
      expect(page.locator('xpath=//span[text()="[Metrics Kubernetes] Cluster Overview"]')).toBeVisible(),
      dashboardPage.assertNoDashboard().then(() => {
        throw new Error('Test is failed because no dashboard found');
        })
      ]);
    logger.info('Clicking on the "Cluster Overview" dashboard');
    await page.locator('xpath=//span[text()="[Metrics Kubernetes] Cluster Overview"]').click();
  }, 'Searching for the "Cluster Overview" dashboard and navigating to it');

  logger.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step02', stepData, page, async () => {
    logger.info(getDatePickerLogMessage());
    await datePicker.setInterval();
    logger.info('Asserting visibility of the "Cores used vs total cores" and "Top Memory intensive pods per Node" visualizations');
    await Promise.race([
      Promise.all([
        headerBar.assertLoadingIndicator(),
        dashboardPage.assertVisibilityVisualization(coresUsedVsTotal),
        dashboardPage.assertVisibilityVisualization(topMemoryIntensivePods)
          ]),
      dashboardPage.assertEmbeddedError(coresUsedVsTotal).then(() => {
        throw new Error('Test is failed due to an error when loading visualization');
        }),
      dashboardPage.assertEmbeddedError(topMemoryIntensivePods).then(() => {
        throw new Error('Test is failed due to an error when loading visualization');
        }),
      dashboardPage.assertNoData(coresUsedVsTotal).then(() => {
        throw new Error(`Test is failed because no data found for visualization ${coresUsedVsTotal}`);
        }),
      dashboardPage.assertNoData(topMemoryIntensivePods).then(() => {
        throw new Error(`Test is failed because no data found for visualization ${topMemoryIntensivePods}`);
        }),
      notifications.assertErrorFetchingResource().then(() => {
        throw new Error('Test is failed due to an error when loading data');
        })
      ]);
  }, 'Setting the search interval and asserting visibility of the "Cores used vs total cores" and "Top Memory intensive pods per Node" visualizations');
  (testInfo as any).stepData = stepData;
});

test('K8S Aggregations dashboard', async ({ page, dashboardPage, datePicker, headerBar}, testInfo) => {
  let stepData: object[] = [];
  const title = "K8S Aggregations";
  await testStep('step01', stepData, page, async () => {
    await page.goto('/app/dashboards');
    await dashboardPage.assertVisibilityHeading();
    await dashboardPage.assertVisibilityTable();
    logger.info('Searching for the dashboard: ' + title);
    await dashboardPage.searchDashboard(title);
    await page.getByRole('link', { name: '[Playwright Test] K8S Aggregations' }).click();
  }, 'Searching for the "K8S Aggregations" dashboard and navigating to it');
  
  await testStep('step02', stepData, page, async () => {
    logger.info(`${getDatePickerLogMessage()} and asserting the visualization: ` + title);
    await datePicker.setInterval();
    await headerBar.assertVisibleLoadingIndicator();
    await Promise.race([
      headerBar.assertLoadingIndicator(),
      dashboardPage.assertAlreadyClosedError(title).then(() => {
        throw new Error(`Test is failed due to an embedded error when loading visualization: 'Already closed, can't increment ref count'`);
        }),
      dashboardPage.assertNoData(title).then(() => {
        throw new Error('Test is failed due to not available data');
      })
    ])
  }, 'Setting search interval and ensuring visualizations are loaded');
  (testInfo as any).stepData = stepData;
});

test('Infrastructure - Inventory', async ({ datePicker, inventoryPage, page }, testInfo) => {
  const cpuUsage = "infraAssetDetailsKPIcpuUsage";
  const memoryUsage = "infraAssetDetailsKPImemoryUsage";
  const podCpuUsage = "podCpuUsage";
  const podMemoryUsage = "podMemoryUsage";
  let stepData: object[] = [];

  await testStep('step01', stepData, page, async () => {
    logger.info('Navigating to Infrastructure inventory');
    await page.goto('/app/metrics/inventory');
    logger.info('Asserting visibility of the waffle map');
    await Promise.race([
      inventoryPage.assertWaffleMap(),
      inventoryPage.assertNoData().then(() => {
        throw new Error('Test is failed because there is no data to display in the waffle map');
        })
      ]);
    await inventoryPage.clickDismiss();
    await inventoryPage.clickAutoRefreshButton();
    logger.info('Sorting by metric value and clicking on a host');
    await inventoryPage.sortByMetricValue();
    await inventoryPage.memoryUsage();
    await inventoryPage.clickNodeWaffleContainer();
    await inventoryPage.clickOpenAsPageButton();
  }, 'Navigating to Infrastructure inventory, asserting waffle map, sorting by metric value and selecting a host');

  logger.info('Waiting for 20s before proceeding to the next step...');
  await page.waitForTimeout(20000);
  
  await testStep('step02', stepData, page, async () => {
    logger.info(getDatePickerLogMessage());
    await datePicker.setInterval();
    await page.mouse.wheel(0, 900);
    logger.info('Asserting visibility of the "Host CPU Usage" and "Host Memory Usage" visualizations');
    await Promise.race([
      Promise.all([
        inventoryPage.assertVisibilityVisualization(cpuUsage),
        inventoryPage.assertVisibilityVisualization(memoryUsage)
        ]),
        inventoryPage.assertBoundaryFatalHeader().then(() => {
          throw new Error('Test is failed due to an error when loading data');
          }),
        inventoryPage.assertVisualizationNoData(cpuUsage).then(() => {
          throw new Error('Test is failed due to an error when loading data');
          })
    ]);
  }, 'Setting search interval, asserting "Host CPU Usage" & "Host Memory Usage" visualizations visibility');

  logger.info('Waiting for 20s before proceeding to the next step...');
  await page.waitForTimeout(20000);

  await testStep('step03', stepData, page, async () => {
    await inventoryPage.clickReturnButton();
    await inventoryPage.closeInfraAssetDetailsFlyout();
    logger.info('Switching to Pods view');
    await inventoryPage.switchInventoryToPodsView();
    logger.info('Asserting visibility of the waffle map');
    await Promise.race([
      inventoryPage.assertWaffleMap(),
      inventoryPage.assertNoData().then(() => {
        throw new Error('Test is failed because there is no data to display in the waffle map');
        })
      ]);
    logger.info('Sorting by metric value and clicking on a pod name');
    await inventoryPage.sortByMetricValue();
    await inventoryPage.switchToTableView();
    await inventoryPage.clickTableCell();
    await inventoryPage.clickPopoverK8sMetrics();
  }, 'Selecting "Pods" as "Show" option, asserting waffle map, then navigating to the Kubernetes Pod metrics');

  logger.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step04', stepData, page, async () => {
    logger.info(getDatePickerLogMessage());
    await datePicker.setInterval();
    logger.info('Asserting visibility of the "Pod CPU Usage" and "Pod Memory Usage" visualizations');
    await Promise.race([
      Promise.all([
        inventoryPage.assertVisibilityPodVisualization(podCpuUsage),
        inventoryPage.assertVisibilityPodVisualization(podMemoryUsage)
        ]),
      inventoryPage.assertNoData().then(() => {
        throw new Error('Test is failed because there is no data to display in the pod visualization');
        })
    ]);
  }, 'Setting search interval, asserting "Pod CPU Usage" & "Pod Memory Usage" visualization visibility');
  (testInfo as any).stepData = stepData;
});
