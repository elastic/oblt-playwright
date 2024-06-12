import {test} from '../../tests/fixtures/serverless/basePage';
import {expect} from '@playwright/test';

test.beforeEach(async ({ landingPage, page }) => {
  await landingPage.goto();
  if (await landingPage.spaceSelector().isVisible()) {
    await page.locator('xpath=//a[contains(text(),"Default")]').click();
    await expect(page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]')).toBeVisible();
  };
  await landingPage.clickDiscover();
});

test('Logs Explorer', async ({datePicker, logsExplorerPage, page}) => {
  // Step 01 - Navigates to Logs Explorer.
  await test.step('step01', async () => {
    await logsExplorerPage.clickLogsExplorerTab();
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
    await datePicker.assertVisibilityDatePicker();
    await datePicker.clickDatePicker();
    await datePicker.selectDate();
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