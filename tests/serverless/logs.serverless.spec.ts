import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/app/discover');
});

test('Logs Explorer', async ({page}) => {
  // Navigates to Logs Explorer.
  await page.getByTestId('logExplorerTab').click();
  await expect(page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]')).toBeVisible();
  await expect(page.locator('xpath=//div[@data-grid-row-index="0"]')).toBeVisible();

  // Filters by nginx access logs.
  await page.getByTestId('datasetSelectorPopoverButton').click();
  await page.locator('xpath=//button//span[text()="Nginx"]').click();
  await page.locator('xpath=//button//span[text()="access"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]')).toBeVisible();
  await expect(page.locator('xpath=//div[@data-grid-row-index="0"]')).toBeVisible();

  // Filters data by selected date picker option.
  await expect(page.getByTestId('superDatePickerToggleQuickMenuButton')).toBeVisible();
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]')).toBeVisible();
  await expect(page.locator('xpath=//div[@data-grid-row-index="0"]')).toBeVisible();

  // Clicks on one of the listed documents and waits for the content to load.
  await page.locator('xpath=//div[@data-grid-row-index="0"]').click();
  await expect(page.getByTestId('logExplorerFlyoutLogMessage')).toBeVisible();
  await expect(page.getByTestId('logExplorerFlyoutService')).toBeVisible();
  await expect(page.getByTestId('kbnDocViewer')).toBeVisible();
});