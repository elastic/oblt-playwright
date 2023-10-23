import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('APM user journey', async ({ page }) => {
  // Navigates to Observability > APM > Services.
  await page.getByRole('link', { name: 'Services' }).click();
  await page.waitForLoadState('networkidle');
  // Clicks on the service name from the Inventory.
  await page.getByText('opbeans-go', { exact: true }).click();
  await page.waitForLoadState('networkidle');
  // Filters data by last 24 hours.
  await page.getByLabel('Date quick select').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await page.waitForLoadState('networkidle');
  // Opens the "Transactions" tab. Clicks on the most impactful transaction.
  await page.getByTestId('transactionsTab').click();
  await page.locator('xpath=//table[@class="euiTable css-0 euiTable--responsive"]//tbody[@class="css-0"]//tr[@class="euiTableRow"][1]//td[@class="euiTableRowCell euiTableRowCell--middle"][1]//a').click();
  await page.waitForLoadState('networkidle');
  // Clicks on the "Failed transaction correlations" tab.
  await page.getByRole('tab', { name: 'Failed transaction correlations' }).click();
  await page.waitForLoadState('networkidle');
  // Sorts the result by field value.
  await page.getByRole('button', { name: 'Field value', exact: true }).click();
});