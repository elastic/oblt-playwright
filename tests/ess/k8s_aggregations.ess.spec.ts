import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('User journey: Querying aggregated data from K8S', async ({ page }) => {
  // Navigates to Observability > Stack Management > Saved Objects.
  await page.getByTestId('toggleNavButton').click();
  await page.getByRole('link', { name: 'Stack Management' }).click( {force: true} );
  await expect(page.getByRole('link', { name: 'Saved Objects' })).toBeVisible();
  await page.getByRole('link', { name: 'Saved Objects' }).click();

  // Uploads "Average container CPU core usage in ns" dashboard.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/[Playwright Test] Average container CPU core usage in ns.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();

  // Uploads "Average container memory usage in bytes" dashboard.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/[Playwright Test] Average container memory usage in bytes.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();

  // Uploads "CPU usage per container of the total node cpu" dashboard.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/[Playwright Test] CPU usage per container of the total node cpu.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();

  // Uploads "CPU usage per pod of the total node cpu" dashboard.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/[Playwright Test] CPU usage per pod of the total node cpu.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();
    
  // Uploads "Memory usage per container of the total node memory" dashboard.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/[Playwright Test] Memory usage per container of the total node memory.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();

  // Uploads "Memory usage per pod of the total node memory" dashboard.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/[Playwright Test] Memory usage per pod of the total node memory.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();

  // Uploads "Percentile_CPU_Usage_per_Container" dashboard.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/[Playwright Test] Percentile_CPU_Usage_per_Container.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();

  // Uploads "Unique deployments count" dashboard.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/[Playwright Test] Unique deployments count.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();

  // Navigates to Dashboards, opens "Average container CPU core usage in ns" dashboard.
  await page.getByTestId('toggleNavButton').click();
  await page.locator('xpath=//a[@data-test-subj="collapsibleNavAppLink-overview" and contains(text(),"Analytics")]').click();
  await page.locator('xpath=//a[contains(text(),"Dashboard")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.getByRole('link', { name: 'Average container CPU core usage in ns' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 15 minutes, gets visualization load time.
  await expect(page.locator('xpath=//div[@data-title="Average container CPU core usage in ns"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
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
  await expect(page.locator('xpath=//div[@data-title="Average container CPU core usage in ns"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
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
  await expect(page.locator('xpath=//div[@data-title="Average container CPU core usage in ns"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await page.getByTestId('embeddablePanelToggleMenuIcon').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  console.log("Average container CPU core usage | Last 24 hours | Request time:", await page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
  console.log("Average container CPU core usage | Last 24 hours | Query time:", await page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Navigates to Observability > Stack Management > Saved Objects.
  await page.getByTestId('toggleNavButton').click();
  await page.getByRole('link', { name: 'Stack Management' }).click( {force: true} );
  await expect(page.getByRole('link', { name: 'Saved Objects' })).toBeVisible();
  await page.getByRole('link', { name: 'Saved Objects' }).click();

  // Deletes dashboards.
  await page.getByTestId('savedObjectSearchBar').fill('Average container CPU core usage in ns');
  await page.keyboard.press('Enter');
  await page.getByRole('link', { name: 'Playwright Test' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByTestId('checkboxSelectAll').click();
  // await page.locator('xpath=//tr[@class="euiTableRow euiTableRow-isSelectable euiTableRow-hasActions"][1]/td[1]//input').click();
  await page.getByTestId('savedObjectsManagementDelete').click();
  await page.getByTestId('confirmModalConfirmButton').click();
  await page.waitForLoadState('networkidle');
});