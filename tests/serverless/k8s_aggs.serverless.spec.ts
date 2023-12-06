import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/app/dashboards');
});

test('Average container CPU core usage', async ({page}) => {
  // Navigates to Dashboards, opens "Average container CPU core usage in ns" dashboard.
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Average container CPU core usage in ns' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Average container CPU core usage in ns"]//canvas[@class="echCanvasRenderer"]'), 'visualization should be visible').toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Average container CPU core usage |", process.env.DATE_PICKER , "| Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Average container CPU core usage |", process.env.DATE_PICKER , "| Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  // Log Elasticsearch query.
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  async function logQuery() {
  let clipboardData = await page.evaluate("navigator.clipboard.readText()");
  console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
  }
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();
});

test('Average container memory usage in bytes', async ({page}) => {
  // Navigates to Dashboards, opens "Average container memory usage in bytes" dashboard.
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Average container memory usage in bytes' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Average container memory usage in bytes"]//canvas[@class="echCanvasRenderer"]'), 'visualization should be visible').toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Average container memory usage in bytes |", process.env.DATE_PICKER , "| Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Average container memory usage in bytes |", process.env.DATE_PICKER , "| Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  async function logQuery() {
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();
});

test('CPU usage per container of the total node cpu', async ({page}) => {
  // Navigates to Dashboards, opens "CPU usage per container of the total node cpu" dashboard.
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] CPU usage per container of the total node cpu' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] CPU usage per container of the total node cpu"]//canvas[@class="echCanvasRenderer"]'), 'visualization should be visible').toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("CPU usage per container of the total node cpu |", process.env.DATE_PICKER , "| Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("CPU usage per container of the total node cpu |", process.env.DATE_PICKER , "| Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  async function logQuery() {
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();
});

test('CPU usage per pod of the total node cpu', async ({page}) => {
  // Navigates to Dashboards, opens "CPU usage per pod of the total node cpu" dashboard.
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] CPU usage per pod of the total node cpu' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] CPU usage per pod of the total node cpu"]//canvas[@class="echCanvasRenderer"]'), 'visualization should be visible').toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("CPU usage per pod of the total node cpu |", process.env.DATE_PICKER , "| Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("CPU usage per pod of the total node cpu |", process.env.DATE_PICKER , "| Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  async function logQuery() {
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();
});

test('Memory usage per container of the total node memory', async ({page}) => {
  // Navigates to Dashboards, opens "Memory usage per container of the total node memory" dashboard.
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Memory usage per container of the total node memory' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Memory usage per container of the total node memory"]//canvas[@class="echCanvasRenderer"]'), 'visualization should be visible').toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Memory usage per container of the total node memory |", process.env.DATE_PICKER , "| Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Memory usage per container of the total node memory |", process.env.DATE_PICKER , "| Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  async function logQuery() {
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();
});

test('Memory usage per pod of the total node memory', async ({page}) => {
  // Navigates to Dashboards, opens "Memory usage per pod of the total node memory" dashboard.
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Memory usage per pod of the total node memory' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Memory usage per pod of the total node memory"]//canvas[@class="echCanvasRenderer"]'), 'visualization should be visible').toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Memory usage per pod of the total node memory |", process.env.DATE_PICKER , "| Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Memory usage per pod of the total node memory |", process.env.DATE_PICKER , "| Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  async function logQuery() {
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();
});

test('Percentile CPU Usage per container', async ({page}) => {
  // Navigates to Dashboards, opens "Percentile CPU Usage per container" dashboard.
  await page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Percentile CPU Usage per container' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Percentile CPU Usage per container"]//canvas[@class="echCanvasRenderer"]'), 'visualization should be visible').toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Percentile CPU Usage per container |", process.env.DATE_PICKER , "| Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Percentile CPU Usage per container |", process.env.DATE_PICKER , "| Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  async function logQuery() {
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();
});