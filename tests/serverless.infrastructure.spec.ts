import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Infrastructure monitoring user journey', async ({ page }) => {
  await page.waitForLoadState('networkidle');
  await page.locator('xpath=//button[@aria-controls="project_settings_project_nav"]').click();
  // Opens Fleet.
  await page.locator('xpath=//a[@href="/app/fleet"]').click();
  await page.waitForLoadState('networkidle');
  await page.getByTestId('addAgentButton').isVisible();
  await page.locator('xpath=//div[contains(@class, "euiTableCellContent__text") and contains(., "Loading agents...")]').isHidden();
});