import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { expect } from "@playwright/test";
import { getPodData, fetchClusterData, spaceSelectorServerless, writeJsonReport } from "../../src/helpers.ts";
import { TIME_VALUE, TIME_UNIT } from '../../src/env.ts';
import { logger } from '../../src/logger.ts';

let resultsContainer: string[] = [`\nTest results:`];
let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Check pod data', async ({ request }) => {
  logger.info('Checking if pod data is available');
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
  logger.info('Navigating to the "Infrastructure" section');
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
  await writeJsonReport(clusterData, testInfo, testStartTime, stepsData);
});

test.afterAll('Log test suite summary', async ({}, testInfo) => {
  if (testInfo.status == 'skipped') {
      resultsContainer.push(`Test "${testInfo.title}" skipped`);
      }
  resultsContainer.forEach((result) => {
    console.log(`${result}\n`);
  });
});

test('Infrastructure - Cluster Overview dashboard', async ({ dashboardPage, datePicker, headerBar, sideNav, notifications, page }, testInfo) => {
  const coresUsedVsTotal = "Cores used vs total cores";
  const topMemoryIntensivePods = "Top Memory intensive pods per Node";
  let steps: object[] = [];

  await test.step('step01', async () => {
    const stepStartTime = performance.now();

    logger.info('Navigating to Dashboards');
    await sideNav.clickDashboards();
    await dashboardPage.assertVisibilityHeading();
    await dashboardPage.assertVisibilityTable();
    logger.info('Searching for the "Cluster Overview" dashboard');
    await dashboardPage.searchDashboard('Cluster Overview');
    await page.keyboard.press('Enter');
    await Promise.race([
      expect(page.getByRole('link', { name: "[Metrics Kubernetes] Cluster Overview" })).toBeVisible(),
      dashboardPage.assertNoDashboard().then(() => {
        throw new Error('Test is failed because no dashboard found');
        })
      ]);
    logger.info('Clicking on the "Cluster Overview" dashboard');
    await page.getByRole('link', { name: "[Metrics Kubernetes] Cluster Overview" }).click();

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step01": stepDuration});
  });

  await test.step('step02', async () => {
    const stepStartTime = performance.now();
    
    logger.info(`Setting the search period of last ${TIME_VALUE} ${TIME_UNIT}`);
    await datePicker.clickDatePicker();
    await datePicker.fillTimeValue(TIME_VALUE);
    await datePicker.selectTimeUnit(TIME_UNIT);
    await datePicker.clickApplyButton();
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

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step02": stepDuration});
  });
  (testInfo as any).stepsData = steps;
});

test('Infrastructure - Inventory', async ({ datePicker, inventoryPage, sideNav }, testInfo) => {
  const cpuUsage = "infraAssetDetailsKPIcpuUsage";
  const memoryUsage = "infraAssetDetailsKPImemoryUsage";
  const podCpuUsage = "podCpuUsage";
  const podMemoryUsage = "podMemoryUsage";
  let steps: object[] = [];

  await test.step('step01', async () => {
    const stepStartTime = performance.now();

    logger.info('Navigating to Infrastructure inventory');
    await sideNav.clickInventory();
    logger.info('Asserting visibility of the waffle map');
    await Promise.race([
      inventoryPage.assertWaffleMap(),
      inventoryPage.assertNoData().then(() => {
        throw new Error('Test is failed because there is no data to display in the waffle map');
        })
      ]);
    await inventoryPage.clickDismiss();
    logger.info('Sorting by metric value and clicking on a host');
    await inventoryPage.sortByMetricValue();
    await inventoryPage.memoryUsage();
    await inventoryPage.clickNodeWaffleContainer();

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step01": stepDuration});
  });
  
  await test.step('step02', async () => {
    const stepStartTime = performance.now();

    logger.info(`Setting the search period of last ${TIME_VALUE} ${TIME_UNIT}`);
    await datePicker.setPeriod();
    logger.info('Asserting visibility of the "Host CPU Usage" and "Host Memory Usage" visualizations');
    await Promise.race([
      Promise.all([
        inventoryPage.assertVisibilityVisualization(cpuUsage),
        inventoryPage.assertVisibilityVisualization(memoryUsage)
        ]),
        inventoryPage.assertBoundaryFatalHeader().then(() => {
          throw new Error('Test is failed due to an error when loading data');
          })
    ]);

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step02": stepDuration});
  });

  await test.step('step03', async () => {
    const stepStartTime = performance.now();

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

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step03": stepDuration});
  });

  await test.step('step04', async () => {
    const stepStartTime = performance.now();

    logger.info(`Setting the search period of last ${TIME_VALUE} ${TIME_UNIT}`);
    await datePicker.setPeriod();
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

    const stepDuration = performance.now() - stepStartTime;
    steps.push({"step04": stepDuration});
  });
  (testInfo as any).stepsData = steps;
});
