import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('User journey: Infrastructure Monitoring', async ({ page }) => {
  // Navigates to Dashboards, filters dashboards by Kubernetes tag.
  await page.getByTestId('toggleNavButton').click();
  await page.locator('xpath=//a[@data-test-subj="collapsibleNavAppLink-overview" and contains(text(),"Analytics")]').click();
  await page.locator('xpath=//a[contains(text(),"Dashboard")]').click();
  await expect(page.locator('xpath=//*[@id="dashboardListingHeading"]')).toBeVisible();
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
  await expect(page.locator('xpath=//div[@data-title="Cores used vs total cores"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();

  // Navigates to Observability > Infrastructure > Inventory.
  await page.getByTestId('toggleNavButton').click();
  await page.getByRole('link', { name: 'Infrastructure' }).click();
  await expect(page.locator('xpath=//h1[contains(text(),"Inventory")]')).toBeVisible();
  await page.getByTestId('infraWaffleTimeControlsAutoRefreshButton').click();
  await expect(page.getByTestId('infraWaffleTimeControlsStopRefreshingButton')).toBeVisible();

  // Ensures "Hosts" is selected as "Show" option. Clicks on any displayed host to open the detailed view.
  await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]/*[@data-test-subj="nodeContainer"][1]//button').click({ force: true });
  await page.locator('xpath=//div[contains(@class, "euiFlyoutBody__overflowContent")]//*[@data-test-subj="superDatePickerToggleQuickMenuButton"]').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.locator('xpath=//div[@data-test-embeddable-id="infraAssetDetailsKPIcpuUsage"]')).toBeVisible();
  await expect(page.locator('xpath=//div[@data-test-embeddable-id="infraAssetDetailsMetricsChartmemoryUsage"]')).toBeVisible();

  // Returns back to Observability > Infrastructure > Inventory.
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Selects "Pods" as "Show" option.
  await page.getByTestId('openInventorySwitcher').click();
  await page.getByTestId('goToPods').click();

  // Clicks on the tile of some pod, then clicks on the "Kubernetes Pod metrics" link.
  await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]').hover();
  await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]/span[1]/div[@data-test-subj="nodeContainer"]').click({ force: true });
  await page.locator('xpath=//*[contains(text(),"Kubernetes Pod metrics")]').click();

  // Filters data by last 24 hours.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.getByTestId('globalLoadingIndicator')).toBeVisible();
  await expect(page.getByTestId('globalLoadingIndicator-hidden')).toBeVisible();

  // Navigates to Observability > Infrastructure > Hosts.
  await page.getByRole('link', { name: 'Hosts' }).click();
  await page.waitForLoadState('networkidle');

  // Clicks on the "Logs" tab, filters logs by searching "error".
  await page.getByTestId('hostsView-tabs-logs').click();
  await page.getByPlaceholder('Search for log entries...').fill('error');
  await page.waitForLoadState('networkidle');

  // Clicks on the "Open in Logs"
  await page.locator('xpath=//*[contains(text(),"Open in Logs")]').click();
  await page.waitForLoadState('networkidle');

  // Navigates to Observability > Infrastructure > Metrics Explorer.
  await page.getByTestId('observability-nav-metrics-metrics_explorer').click();
  await page.waitForLoadState('networkidle');

  // Aggregates by 95th Percentile.
  await page.getByTestId('infraMetricsExplorerAggregationPickerSelect').click();
  await page.waitForLoadState('networkidle');

  // Filters data by last 24 hours.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.getByLabel('Commonly used').getByRole('button', { name: 'Last 24 hours' }).click();
  await expect(page.getByTestId('globalLoadingIndicator')).toBeVisible();
  await expect(page.getByTestId('globalLoadingIndicator-hidden')).toBeVisible();

  // Selects "kubernetes.namespace" as "graph per" option. Searches for "kube-system".
  await page.locator('xpath=//input[@aria-label="Graph per"]').click();
  await page.locator('xpath=//input[@aria-label="Graph per"]').fill('kubernetes.namespace');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
  await page.locator('xpath=//input[@data-test-subj="infraSearchField"]').click();
  await page.locator('xpath=//input[@data-test-subj="infraSearchField"]').fill('kube-system');
  await page.keyboard.press('Enter');
  await expect(page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]')).toBeVisible();
});