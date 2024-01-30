import {test} from '../../tests/fixtures/serverless/basePage';

test.beforeEach(async ({ landingPage }) => {
  await landingPage.goto();
  await landingPage.clickDiscover();
});

test('Logs Explorer', async ({datePicker, logsExplorerPage, page}) => {
  // Navigates to Logs Explorer.
  await logsExplorerPage.clickLogsExplorerTab();
  await logsExplorerPage.assertCanvasVisibility();
  await logsExplorerPage.assertDataGridRowVisibility();

  // Filters by nginx access logs.
  await logsExplorerPage.filterByNginxAccess();
  await page.waitForLoadState('networkidle');
  await logsExplorerPage.assertCanvasVisibility();
  await logsExplorerPage.assertDataGridRowVisibility();

  // Filters data by selected date picker option.
  await datePicker.assertDatePickerVisibility();
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await page.waitForLoadState('networkidle');
  await logsExplorerPage.assertCanvasVisibility();
  await logsExplorerPage.assertDataGridRowVisibility();

  // Clicks on one of the listed documents and waits for the content to load.
  await logsExplorerPage.expandLogsDataGridRow();
  await logsExplorerPage.assertFlyoutLogMessageVisibility();
  await logsExplorerPage.assertFlyoutServiceVisibility();
  await logsExplorerPage.assertDocViewerVisibility();
});