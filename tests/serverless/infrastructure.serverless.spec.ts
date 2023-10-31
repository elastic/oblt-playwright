import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('User journey: Infrastructure Monitoring', async ({ page }) => {
  // Navigates to Observability > Infrastructure > Inventory.
  await page.locator('xpath=//button[@aria-controls="observability_project_nav.metrics"]').click();
  await page.locator('xpath=//button[@aria-controls="project_settings_project_nav"]').click();
  await page.locator('xpath=//*[contains(text(),"Inventory")]').click();
});