import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('User journey: Querying aggregated data from K8S', async ({ page }) => {
  // Navigates to Project Settings > Management > Saved Objects.
  await page.getByTestId('accordionArrow accordionArrow-project_settings_project_nav').click();
  await page.locator('xpath=//span[contains(text(),"Management")]').click();
  await expect(page.locator('xpath=//a[contains(text(),"Saved Objects")]')).toBeVisible();
  await page.locator('xpath=//a[contains(text(),"Saved Objects")]').click();

  // Uploads dashboards.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/dashboards.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();

  // Navigates to Dashboards, opens "Average container CPU core usage in ns" dashboard.
  await page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Average container CPU core usage in ns' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 15 minutes, gets visualization load time.
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Average container CPU core usage in ns"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Average container CPU core usage | Last 15 minutes | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Average container CPU core usage | Last 15 minutes | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 1 hour, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 1 hour' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Average container CPU core usage in ns"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Average container CPU core usage | Last 1 hour | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Average container CPU core usage | Last 1 hour | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 24 hours, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Average container CPU core usage in ns"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Average container CPU core usage | Last 24 hours | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Average container CPU core usage | Last 24 hours | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Navigates to Dashboards, opens "Average container memory usage in bytes" dashboard.
  await page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Average container memory usage in bytes' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 15 minutes, gets visualization load time.
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Average container memory usage in bytes"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Average container memory usage in bytes | Last 15 minutes | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Average container memory usage in bytes | Last 15 minutes | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 1 hour, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 1 hour' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Average container memory usage in bytes"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Average container memory usage in bytes | Last 1 hour | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Average container memory usage in bytes | Last 1 hour | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 24 hours, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Average container memory usage in bytes"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Average container memory usage in bytes | Last 24 hours | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Average container memory usage in bytes | Last 24 hours | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Navigates to Dashboards, opens "CPU usage per container of the total node cpu" dashboard.
  await page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] CPU usage per container of the total node cpu' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 15 minutes, gets visualization load time.
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] CPU usage per container of the total node cpu"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("CPU usage per container of the total node cpu | Last 15 minutes | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("CPU usage per container of the total node cpu | Last 15 minutes | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 1 hour, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 1 hour' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] CPU usage per container of the total node cpu"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("CPU usage per container of the total node cpu | Last 1 hour | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("CPU usage per container of the total node cpu | Last 1 hour | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 24 hours, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] CPU usage per container of the total node cpu"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("CPU usage per container of the total node cpu | Last 24 hours | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("CPU usage per container of the total node cpu | Last 24 hours | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Navigates to Dashboards, opens "CPU usage per pod of the total node cpu" dashboard.
  await page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] CPU usage per pod of the total node cpu' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 15 minutes, gets visualization load time.
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] CPU usage per pod of the total node cpu"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("CPU usage per pod of the total node cpu | Last 15 minutes | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("CPU usage per pod of the total node cpu | Last 15 minutes | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 1 hour, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 1 hour' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] CPU usage per pod of the total node cpu"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("CPU usage per pod of the total node cpu | Last 1 hour | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("CPU usage per pod of the total node cpu | Last 1 hour | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 24 hours, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] CPU usage per pod of the total node cpu"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("CPU usage per pod of the total node cpu | Last 24 hours | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("CPU usage per pod of the total node cpu | Last 24 hours | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Navigates to Dashboards, opens "Memory usage per container of the total node memory" dashboard.
  await page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Memory usage per container of the total node memory' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 15 minutes, gets visualization load time.
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Memory usage per container of the total node memory"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Memory usage per container of the total node memory | Last 15 minutes | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Memory usage per container of the total node memory | Last 15 minutes | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 1 hour, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 1 hour' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Memory usage per container of the total node memory"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Memory usage per container of the total node memory | Last 1 hour | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Memory usage per container of the total node memory | Last 1 hour | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 24 hours, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Memory usage per container of the total node memory"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Memory usage per container of the total node memory | Last 24 hours | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Memory usage per container of the total node memory | Last 24 hours | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Navigates to Dashboards, opens "Memory usage per pod of the total node memory" dashboard.
  await page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Memory usage per pod of the total node memory' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 15 minutes, gets visualization load time.
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Memory usage per pod of the total node memory"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Memory usage per pod of the total node memory | Last 15 minutes | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Memory usage per pod of the total node memory | Last 15 minutes | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 1 hour, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 1 hour' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Memory usage per pod of the total node memory"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Memory usage per pod of the total node memory | Last 1 hour | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Memory usage per pod of the total node memory | Last 1 hour | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 24 hours, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Memory usage per pod of the total node memory"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Memory usage per pod of the total node memory | Last 24 hours | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Memory usage per pod of the total node memory | Last 24 hours | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Navigates to Dashboards, opens "Percentile CPU Usage per container" dashboard.
  await page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: '[Playwright Test] Percentile CPU Usage per container' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 15 minutes, gets visualization load time.
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Percentile CPU Usage per container"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Percentile CPU Usage per container | Last 15 minutes | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Percentile CPU Usage per container | Last 15 minutes | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 1 hour, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 1 hour' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Percentile CPU Usage per container"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Percentile CPU Usage per container | Last 1 hour | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Percentile CPU Usage per container | Last 1 hour | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Filters data by last 24 hours, gets visualization load time.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.locator('xpath=//div[@data-title="[Playwright Test] Percentile CPU Usage per container"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Percentile CPU Usage per container | Last 24 hours | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Percentile CPU Usage per container | Last 24 hours | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Navigates to Project Settings > Management > Saved Objects.
  await page.locator('xpath=//span[contains(text(),"Management")]').click();
  await expect(page.locator('xpath=//a[contains(text(),"Saved Objects")]')).toBeVisible();
  await page.locator('xpath=//a[contains(text(),"Saved Objects")]').click();

  // Deletes dashboards.
  await page.getByTestId('savedObjectSearchBar').fill('Playwright Test');
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
  await page.getByTestId('checkboxSelectAll').click();
  await page.getByTestId('savedObjectsManagementDelete').click();
  await page.getByTestId('confirmModalConfirmButton').click();
  await page.waitForLoadState('networkidle');
});