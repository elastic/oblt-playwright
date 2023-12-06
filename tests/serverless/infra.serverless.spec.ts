import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('accordionArrow accordionArrow-observability_project_nav.metrics').click();
});

test('Infrastructure - Cluster Overview dashboard', async ({ page }) => {
  // Navigates to Dashboards, filters dashboards by Kubernetes tag.
  await page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
  await expect(page.locator('xpath=//tbody[@class="css-0"]')).toBeVisible();
  await page.locator('xpath=//span[@data-text="Tags"]').click();
  await page.getByTestId('tag-searchbar-option-Kubernetes').click();
  await page.waitForLoadState('networkidle');

  // Opens [Metrics Kubernetes] Cluster Overview dashboard.
  await page.getByRole('link', { name: '[Metrics Kubernetes] Cluster Overview' }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 1 hour.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.locator('xpath=//input[@aria-label="Time value"]').fill('1');
  await page.locator('xpath=//*[@aria-label="Time unit"]').selectOption('Hours');
  await page.locator('xpath=//span[contains(text(), "Apply")]').click();
  
  // Asserts "Cores used vs total cores" visualization visibility.
  await expect(page.locator('xpath=//div[@data-title="Cores used vs total cores"]//canvas[@class="echCanvasRenderer"]'), '"Cores used vs total cores" visualization should be visible').toBeVisible();
  // Logs Elasticsearch query.
  await page.locator('xpath=//button[@aria-label="Panel options for Cores used vs total cores"]').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  console.log('[Metrics Kubernetes] Cores used vs total cores.');
  async function logQuery() {
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();
  
  // Asserts "Top memory intensive pods" visualization visibility.
  await expect(page.locator('xpath=//div[@data-title="Top memory intensive pods"]//canvas[@class="echCanvasRenderer"]'), '"Top memory intensive pods" visualization should be visible').toBeVisible();
  // Logs Elasticsearch query.
  await page.locator('xpath=//button[@aria-label="Panel options for Top memory intensive pods"]').click();
  await page.getByTestId('embeddablePanelAction-openInspector').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  console.log('[Metrics Kubernetes] Top memory intensive pods.');
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();
});
  
test('Infrastructure - Inventory', async ({ page }) => {
  // Navigates to Observability > Infrastructure > Inventory.
  await page.locator('xpath=//*[contains(text(),"Inventory")]').click();

  // Ensures "Hosts" is selected as "Show" option. Clicks on any displayed host to open the detailed view.
  await page.locator('xpath=//span[contains(text(),"Dismiss")]').click();
  await page.getByTestId('waffleSortByDropdown').click();
  await page.getByTestId('waffleSortByValue').click();
  await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]').hover();
  await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]/*[@data-test-subj="nodeContainer"][1]').click({ force: true });
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  if (await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).isVisible()) {
    await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  } else {
    await page.locator('xpath=//input[@aria-label="Time value"]').fill('30');
    await page.locator('xpath=//*[@aria-label="Time unit"]').selectOption('Days');
    await page.locator('xpath=//span[contains(text(), "Apply")]').click();
  }
  await page.waitForLoadState('networkidle');

  // Asserts "Host CPU Usage" visualization visibility.
  await expect(page.locator('xpath=//div[@data-test-embeddable-id="infraAssetDetailsKPIcpuUsage"]//div[contains(@class, "echChartContent")]'), '"Host CPU Usage" visualization should be visible').toBeVisible();
  await page.waitForLoadState('networkidle');
  // Logs Elasticsearch query.
  await page.locator('xpath=//div[@data-test-embeddable-id="infraAssetDetailsKPIcpuUsage"]//button[@data-test-subj="embeddablePanelToggleMenuIcon"]').click();
  await page.locator('xpath=//button[@data-test-subj="embeddablePanelAction-openInspector"]').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  console.log('Host: Percentage of CPU time spent in states other than Idle and IOWait, normalized by the number of CPU cores.');
  async function logQuery() {
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }
  logQuery();
  await page.locator('xpath=//div[@data-test-subj="inspectorPanel"]//button[@data-test-subj="euiFlyoutCloseButton"]').click();

  // Asserts "Host Memory Usage" visualization visibility.
  await expect(page.locator('xpath=//div[@data-test-embeddable-id="infraAssetDetailsHostMetricsChartmemoryUsage"]//div[contains(@class, "echChartContent")]'), '"Host Memory Usage" visualization should be visible').toBeVisible();
  await page.waitForLoadState('networkidle');
  // Logs Elasticsearch query.
  await page.locator('xpath=//div[@data-test-embeddable-id="infraAssetDetailsHostMetricsChartmemoryUsage"]//button[@data-test-subj="embeddablePanelToggleMenuIcon"]').click();
  await page.locator('xpath=//button[@data-test-subj="embeddablePanelAction-openInspector"]').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  console.log('Host: Memory usage.');
  logQuery();
  await page.locator('xpath=//div[@data-test-subj="inspectorPanel"]//button[@data-test-subj="euiFlyoutCloseButton"]').click();

  // Returns back to Observability > Infrastructure > Inventory.
  await page.locator('xpath=//div[@data-component-name="infraAssetDetailsFlyout"]//button[@data-test-subj="euiFlyoutCloseButton"]').click();

  // Selects "Pods" as "Show" option.
  await page.getByTestId('openInventorySwitcher').click();
  await page.getByTestId('goToPods').click();
  await page.waitForLoadState('networkidle');

  // Clicks on the tile of some pod, then clicks on the "Kubernetes Pod metrics" link.
  await page.getByTestId('waffleSortByDropdown').click();
  await page.getByTestId('waffleSortByValue').click();
  await page.locator('xpath=//label[@title="Table view"]').click();
  await page.waitForLoadState('networkidle');
  //await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]/span[1]/div[@data-test-subj="nodeContainer"][1]').hover();
  //await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]/span[1]/div[@data-test-subj="nodeContainer"][1]').click({ force: true });
  await page.locator('xpath=(//tbody//td)[1]').click();
  await page.locator('xpath=//*[contains(text(),"Kubernetes Pod metrics")]').click();

  // Filters data by selected date picker option.
  await expect(page.getByTestId('superDatePickerToggleQuickMenuButton')).toBeVisible();
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  // Asserts "Pod CPU Usage" & "Pod Memory Usage" visualization visibility.
  await expect(page.locator('xpath=//div[@data-test-subj="infraMetricsPage"]//div[@id="podCpuUsage"]//div[contains(@class, "echChartContent")]'), '"Pod CPU Usage" visualization should be visible').toBeVisible();
  await expect(page.locator('xpath=//div[@data-test-subj="infraMetricsPage"]//div[@id="podMemoryUsage"]//div[contains(@class, "echChartContent")]'), '"Pod Memory Usage" visualization should be visible').toBeVisible();
});

test('Infrastructure - Hosts', async ({ page }) => {
  // Navigates to Observability > Infrastructure > Hosts.
  await page.getByRole('link', { name: 'Hosts' }).click();
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  await page.waitForLoadState('networkidle');

  // Asserts "Host CPU Usage" visualization visibility.
  await expect(page.locator('xpath=//div[@data-test-embeddable-id="hostsViewKPI-cpuUsage"]//div[contains(@class, "echChartContent")]'), '"Host CPU Usage" visualization should be visible').toBeVisible();
  // Logs Elasticsearch query.
  await page.locator('xpath=//div[@data-test-embeddable-id="hostsViewKPI-cpuUsage"]//button[@data-test-subj="embeddablePanelToggleMenuIcon"]').click();
  await page.locator('xpath=//..//button[@data-test-subj="embeddablePanelAction-openInspector"]').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  console.log('All hosts: Percentage of CPU time spent in states other than Idle and IOWait, normalized by the number of CPU cores.');
  async function logQuery() {
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Asserts "Host Normalized Load" visualization visibility.
  if (await page.locator('xpath=//div[@data-test-embeddable-id="hostsView-metricChart-normalizedLoad1m"]//div[contains(@class, "echChartContent")]').isHidden()){
    await page.keyboard.press('ArrowDown');
  }

  await expect(page.locator('xpath=//div[@data-test-embeddable-id="hostsView-metricChart-normalizedLoad1m"]//div[contains(@class, "echChartContent")]'), '"Host Normalized Load" visualization should be visible').toBeVisible();
  // Logs Elasticsearch query.
  await page.locator('xpath=//div[@data-test-embeddable-id="hostsView-metricChart-normalizedLoad1m"]//button[@data-test-subj="embeddablePanelToggleMenuIcon"]').click();
  await page.locator('xpath=//..//button[@data-test-subj="embeddablePanelAction-openInspector"]').click();
  await page.getByTestId('inspectorViewChooser').click();
  await page.getByTestId('inspectorViewChooserRequests').click();
  await page.getByTestId('inspectorRequestDetailRequest').click();
  await page.getByTestId('inspectorRequestCopyClipboardButton').click();
  console.log('All hosts: Normalized Load.');
  logQuery();
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Clicks on the "Logs" tab, filters logs by searching "error".
  await page.getByTestId('hostsView-tabs-logs').click();
  await page.locator('xpath=//input[@placeholder="Search for log entries..."]').fill('error');

  // Clicks on the "Open in Logs"
  // await page.locator('xpath=//*[contains(text(),"Open in Logs")]').click();
  // await page.waitForLoadState('networkidle');
  // await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  // await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  // await page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER }).click();
  // Asserts "Pod CPU Usage" visualization visibility.
  // await expect(page.locator('xpath=//div[@id="podCpuUsage"]//div[contains(@class, "echChartContent")]'), '"Pod CPU Usage" visualization should be visible').toBeVisible();
  // await page.waitForLoadState('networkidle');
});