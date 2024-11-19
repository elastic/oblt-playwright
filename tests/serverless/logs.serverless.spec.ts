import { test } from '../../tests/fixtures/serverless/basePage';
import { spaceSelectorServerless, waitForOneOf } from "../../src/helpers.ts";

test.beforeEach(async ({ discoverPage, sideNav, spaceSelector }) => {
  await sideNav.goto();
  await spaceSelectorServerless(sideNav, spaceSelector);
  await sideNav.clickDiscover();
  await discoverPage.discoverTab().click();
});

test('Discover - All logs', async ({datePicker, discoverPage}) => {
  await test.step('step01', async () => {
    await discoverPage.selectLogsDataView();
    await datePicker.setPeriod();
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  });
});

test('Discover - Field Statistics', async ({datePicker, discoverPage}) => { 
  await test.step('step01', async () => {
    await discoverPage.selectLogsDataView();
    await datePicker.setPeriod();
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  });

  await test.step('step02', async () => {
    await discoverPage.clickFieldStatsTab();
    await discoverPage.assertVisibilityFieldStatsDocCount();
  });
});

test('Discover - Patterns', async ({datePicker, discoverPage}) => { 
  await test.step('step01', async () => {
    await discoverPage.selectLogsDataView();
    await datePicker.setPeriod();
    await discoverPage.assertChartIsRendered();
    await discoverPage.assertVisibilityCanvas();
    await discoverPage.assertVisibilityDataGridRow();
  });

  await test.step('step02', async () => {
    await discoverPage.clickPatternsTab();
    const [ index ] = await waitForOneOf([
      discoverPage.logPatternsRowToggle(),
      discoverPage.patternsNotLoaded()
      ]);
    const patternsLoaded = index === 0;
    if (patternsLoaded) {
      await discoverPage.assertVisibilityPatternsRowToggle();
      await discoverPage.clickFilterPatternButton();
      await discoverPage.assertChartIsRendered();
      await discoverPage.assertVisibilityCanvas();
      await discoverPage.assertVisibilityDataGridRow();
      } else {
        console.log('Patterns not loaded.');
        throw new Error('Test is failed due to an error when loading categories.');
      }
  });
});