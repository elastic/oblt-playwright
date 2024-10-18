import { test } from '../../tests/fixtures/serverless/basePage';
import { spaceSelectorServerless, waitForOneOf } from "../../src/helpers.ts";

test.beforeEach(async ({ logsExplorerPage, sideNav, spaceSelector }) => {
  await sideNav.goto();
  await spaceSelectorServerless(sideNav, spaceSelector);
  await sideNav.clickDiscover();
  await logsExplorerPage.clickLogsExplorerTab();
});

test('Logs Explorer - Kubernetes Container logs', async ({datePicker, logsExplorerPage}) => {
  await test.step('step01', async () => {
    await logsExplorerPage.filterByKubernetesContainer();
    await logsExplorerPage.assertVisibilityCanvas();
    await logsExplorerPage.assertVisibilityDataGridRow();
  });

  await test.step('step02', async () => {
    await datePicker.setPeriod();
    await logsExplorerPage.assertChartIsRendered();
    await logsExplorerPage.assertVisibilityCanvas();
    await logsExplorerPage.assertVisibilityDataGridRow();
  });
});

test('Logs Explorer - All logs', async ({datePicker, logsExplorerPage}) => {
  await test.step('step01', async () => {
    await datePicker.setPeriod();
    await logsExplorerPage.assertChartIsRendered();
    await logsExplorerPage.assertVisibilityCanvas();
    await logsExplorerPage.assertVisibilityDataGridRow();
  });
});

test('Logs Explorer - Field Statistics', async ({datePicker, logsExplorerPage}) => { 
  await test.step('step01', async () => {
    await datePicker.setPeriod();
    await logsExplorerPage.assertChartIsRendered();
    await logsExplorerPage.assertVisibilityCanvas();
    await logsExplorerPage.assertVisibilityDataGridRow();
  });

  await test.step('step02', async () => {
    await logsExplorerPage.clickFieldStatsTab();
    await logsExplorerPage.assertVisibilityFieldStatsDocCount();
  });
});

test('Logs Explorer - Patterns', async ({datePicker, logsExplorerPage}) => { 
  await test.step('step01', async () => {
    await datePicker.setPeriod();
    await logsExplorerPage.assertChartIsRendered();
    await logsExplorerPage.assertVisibilityCanvas();
    await logsExplorerPage.assertVisibilityDataGridRow();
  });

  await test.step('step02', async () => {
    await logsExplorerPage.clickPatternsTab();
    const [ index ] = await waitForOneOf([
      logsExplorerPage.logPatternsRowToggle(),
      logsExplorerPage.patternsNotLoaded()
      ]);
    const patternsLoaded = index === 0;
    if (patternsLoaded) {
      await logsExplorerPage.assertVisibilityPatternsRowToggle();
      await logsExplorerPage.clickFilterPatternButton();
      await logsExplorerPage.assertChartIsRendered();
      await logsExplorerPage.assertVisibilityCanvas();
      await logsExplorerPage.assertVisibilityDataGridRow();
      } else {
        console.log('Patterns not loaded.');
        throw new Error('Test is failed due to an error when loading categories.');
      }
  });
});