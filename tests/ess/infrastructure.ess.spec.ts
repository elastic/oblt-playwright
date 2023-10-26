import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('User journey: Infrastructure Monitoring', async ({ page }) => {
  // Navigates to Dashboards, filters dashboards by Kubernetes tag.
  await page.getByTestId('toggleNavButton').click();
  await page.locator('//span[@title="Dashboard"]').click();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.locator('xpath=//span[@data-text="Tags"]').click();
  await page.getByTestId('tag-searchbar-option-Kubernetes').click();
  await page.waitForLoadState('networkidle');

  // Opens [Metrics Kubernetes] Cluster Overview dashboard.
  await page.getByRole('link', { name: '[Metrics Kubernetes] Cluster Overview' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 24 hours.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('globalLoadingIndicator')).toBeVisible();
  await expect(page.getByTestId('globalLoadingIndicator-hidden')).toBeVisible();

  // Navigates to Observability > Infrastructure.
  await page.getByTestId('toggleNavButton').click();
  await page.getByRole('link', { name: 'Infrastructure' }).click();
  await expect(page.locator('xpath=//h1[contains(text(),"Inventory")]')).toBeVisible();
  
});