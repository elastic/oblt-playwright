import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { expect, Page } from "@playwright/test";
import { getPodData, fetchClusterData, spaceSelectorServerless, testStep, writeJsonReport } from "../../src/helpers.ts";
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

  const stepDuration = (testInfo as any).stepDuration;
  const stepStart = (testInfo as any).stepStart;
  const stepEnd = (testInfo as any).stepEnd;
  await writeJsonReport(clusterData, testInfo, testStartTime, stepDuration, stepStart, stepEnd);
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
  let stepDuration: object[] = [];
  let stepStart: object[] = [];
  let stepEnd: object[] = [];

  await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
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
  });

  await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
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
  });
  (testInfo as any).stepDuration = stepDuration;
  (testInfo as any).stepStart = stepStart;
  (testInfo as any).stepEnd = stepEnd;
});

test('Infrastructure - Inventory', async ({ datePicker, inventoryPage, page, sideNav }, testInfo) => {
  const cpuUsage = "infraAssetDetailsKPIcpuUsage";
  const memoryUsage = "infraAssetDetailsKPImemoryUsage";
  const podCpuUsage = "podCpuUsage";
  const podMemoryUsage = "podMemoryUsage";
  let stepDuration: object[] = [];
  let stepStart: object[] = [];
  let stepEnd: object[] = [];

  await testStep('step01', stepStart, stepEnd, stepDuration, page, async () => {
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
  });
  
  await testStep('step02', stepStart, stepEnd, stepDuration, page, async () => {
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
  });

  await testStep('step03', stepStart, stepEnd, stepDuration, page, async () => {
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

  await testStep('step04', stepStart, stepEnd, stepDuration, page, async () => {
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
  });
  (testInfo as any).stepDuration = stepDuration;
  (testInfo as any).stepStart = stepStart;
  (testInfo as any).stepEnd = stepEnd;
});
