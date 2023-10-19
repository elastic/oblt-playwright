import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('APM user journey', async ({ page }) => {
  await page.getByRole('link', { name: 'Services' }).click();
  await expect(page.getByTestId('globalLoadingIndicator-hidden')).toBeVisible();
  await page.waitForLoadState('networkidle');
});