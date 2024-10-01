import { test } from '../../tests/fixtures/serverless/basePage';
import { expect } from '@playwright/test';
import { waitForOneOf } from "../../src/types.ts";

test.beforeEach(async ({ landingPage, logsExplorerPage, page }) => {
  await landingPage.goto();
  const [ index ] = await waitForOneOf([
    page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]'),
    landingPage.spaceSelector(),
    ]);
  const spaceSelector = index === 1;
  if (spaceSelector) {
    await page.locator('xpath=//a[contains(text(),"Default")]').click();
    await expect(page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]')).toBeVisible();
    };
  await landingPage.clickDiscover();
  await logsExplorerPage.clickLogsExplorerTab();
});

test.skip('Logs Explorer - Kubernetes Container logs', async ({datePicker, logsExplorerPage}) => {
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