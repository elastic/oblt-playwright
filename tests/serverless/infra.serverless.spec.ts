import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { expect, Page } from "@playwright/test";
import { getPodData, fetchClusterData, spaceSelectorServerless, testStep, writeJsonReport, getDatePickerLogMessageServerless } from "../../src/helpers.ts";
import { TIME_VALUE, TIME_UNIT } from '../../src/env.ts';
import { logger } from '../../src/logger.ts';

let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Check pod data', async ({ request }) => {
  logger.info('Checking if pod data is available in the last 24 hours');
  const podsData = await getPodData(request);
  const podsArr = podsData.nodes;
  test.skip(podsArr.length == 0, 'Test is skipped: No pod data is available');
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ sideNav, spaceSelector }) => {
  await sideNav.goto();
  logger.info('Selecting the default Kibana space')
  await spaceSelectorServerless(sideNav, spaceSelector);
});

test.afterEach('Log test results', async ({}, testInfo) => {
  const stepData = (testInfo as any).stepData;
  await writeJsonReport(clusterData, testInfo, testStartTime, stepData);
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
  });

  logger.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step02', stepData, page, async () => {
    logger.info(getDatePickerLogMessageServerless());
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
  });
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
  });

  logger.info('Waiting for 20s before proceeding to the next step...');
  await page.waitForTimeout(20000);
  
  await testStep('step02', stepData, page, async () => {
    logger.info(getDatePickerLogMessageServerless());
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
  });

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
  });

  logger.info('Waiting for 10s before proceeding to the next step...');
  await page.waitForTimeout(10000);

  await testStep('step04', stepData, page, async () => {
    logger.info(getDatePickerLogMessageServerless());
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
  });
  (testInfo as any).stepData = stepData;
});
