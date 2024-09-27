import { test } from '../../tests/fixtures/stateful/basePage';
import { expect } from "@playwright/test";
import { waitForOneOf } from "../../src/types.ts";

test.beforeEach(async ({ landingPage, page }) => {
  await landingPage.goto();
  const [ index ] = await waitForOneOf([
    page.locator('xpath=//a[@aria-label="Elastic home"]'),
    landingPage.spaceSelector(),
    ]);
  const spaceSelector = index === 1;
  if (spaceSelector) {
      await page.locator('xpath=//a[contains(text(),"Default")]').click();
      await expect(page.locator('xpath=//a[@aria-label="Elastic home"]')).toBeVisible();
    };
  await landingPage.clickObservabilitySolutionLink();
});

test('Logs Explorer', async ({datePicker, logsExplorerPage, observabilityPage, page}) => {
  // Step 01 - Navigates to Logs Explorer.
  await test.step('step01', async () => {
    await observabilityPage.clickExplorer();
    await logsExplorerPage.assertVisibilityCanvas();
    await logsExplorerPage.assertVisibilityDataGridRow();
  });

  // Step 02 - Filters by nginx access logs.
  await test.step('step02', async () => {
    await logsExplorerPage.filterByNginxAccess();
    await page.waitForLoadState('networkidle');
    await logsExplorerPage.assertVisibilityCanvas();
    await logsExplorerPage.assertVisibilityDataGridRow();
  });

  // Step 03 - Filters data by selected date picker option.
  await test.step('step03', async () => {
    // await datePicker.assertVisibilityDatePicker();
    await datePicker.setPeriod();
    await page.waitForLoadState('networkidle');
    await logsExplorerPage.assertVisibilityCanvas();
    await logsExplorerPage.assertVisibilityDataGridRow();
  });

  // Step 04 - Clicks on one of the listed documents and waits for the content to load.
  await test.step('step04', async () => {
    await logsExplorerPage.expandLogsDataGridRow();
    await logsExplorerPage.assertVisibilityFlyoutLogMessage();
    await logsExplorerPage.assertVisibilityFlyoutService();
    await logsExplorerPage.assertVisibilityDocViewer();
  });
});