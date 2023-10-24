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
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await page.waitForLoadState('networkidle');
  
  // Opens the "Transactions" tab. Clicks on the most impactful transaction.
  await page.getByTestId('transactionsTab').click();
  await page.waitForLoadState('networkidle');
  await page.locator('xpath=//table[@class="euiTable css-0 euiTable--responsive"]//tbody[@class="css-0"]//tr[@class="euiTableRow"][1]//td[@class="euiTableRowCell euiTableRowCell--middle"][1]//a').click();
  await page.waitForLoadState('networkidle');
  
  // Clicks on the "Failed transaction correlations" tab.
  await page.getByRole('tab', { name: 'Failed transaction correlations' }).click();
  await page.waitForLoadState('networkidle');
  
  // Sorts the result by field value. Filters the result by a particular field value by clicking on the "+".
  await page.getByRole('button', { name: 'Field value', exact: true }).click();
  await page.locator('xpath=//table[@class="euiTable css-0 euiTable--responsive"]//tbody[@class="css-0"]//tr[@class="euiTableRow euiTableRow-hasActions euiTableRow-isClickable"][1]//td[@class="euiTableRowCell euiTableRowCell--hasActions euiTableRowCell--middle"]//span[1]//button').click();
  await page.waitForLoadState('networkidle');
  
  // Clicks on "Investigate", selects "Host logs".
  await page.getByRole('button', { name: 'Investigate' }).click();
  await page.getByRole('link', { name: 'Host logs' }).click();
  await page.waitForLoadState('networkidle');
  
  // Filters logs by last 24 hours, then filters by error messages.
  await page.getByLabel('Date quick select').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Search field names').click();
  await page.getByPlaceholder('Search field names').fill('error');
  await page.getByTestId('field-error.log.message').click();
  await page.waitForLoadState('networkidle');
  
  // Expands certain document.
  await page.locator('xpath=//div[@data-grid-row-index="1"]//button').click();
  await page.waitForLoadState('networkidle');
  
  // Navigates to Observability > APM > Traces.
  await page.getByRole('link', { name: 'Traces' }).click();
  await page.waitForLoadState('networkidle');
  
  // Opens the "Explorer" tab, filters data by http.response.status_code : 502.
  await page.getByRole('tab', { name: 'Explorer' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Filter your data using KQL syntax').click();
  await page.getByPlaceholder('Filter your data using KQL syntax').fill('http.response.status_code : 502');
  await page.waitForLoadState('networkidle');
  
  // Filters data by last 24 hours.
  await page.getByLabel('Date quick select').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await page.waitForLoadState('networkidle');
  
  // Clicks on the "View related error" in the timeline.
  await page.locator('xpath=//a[@title="View related error"][1]').click();
  await page.waitForLoadState('networkidle');
  
  // Navigates to Observability > APM > Dependencies.
  await page.getByRole('link', { name: 'Dependencies' }).click();
});