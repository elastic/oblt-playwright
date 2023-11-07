import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('User journey: Infrastructure Monitoring', async ({ page }) => {
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
  await expect(page.locator('xpath=//div[@data-title="Cores used vs total cores"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  await expect(page.locator('xpath=//div[@data-title="Top memory intensive pods"]//canvas[@class="echCanvasRenderer"]')).toBeVisible();
  
  // Navigates to Observability > Infrastructure > Inventory.
  await page.locator('xpath=//button[@aria-controls="observability_project_nav.metrics"]').click();
  await page.locator('xpath=//button[@aria-controls="project_settings_project_nav"]').click();
  await page.locator('xpath=//*[contains(text(),"Inventory")]').click();
  await page.getByTestId('infraWaffleTimeControlsAutoRefreshButton').click();
  await expect(page.getByTestId('infraWaffleTimeControlsStopRefreshingButton')).toBeVisible();

  // Ensures "Hosts" is selected as "Show" option. Clicks on any displayed host to open the detailed view.
  await page.locator('xpath=//span[contains(text(),"Dismiss")]').click();
  await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]').hover();
  await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]/*[@data-test-subj="nodeContainer"][1]').click({ force: true });
  await page.locator('xpath=//div[contains(@class, "euiFlyoutBody__overflowContent")]//*[@data-test-subj="superDatePickerToggleQuickMenuButton"]').click();
  await page.locator('xpath=//input[@aria-label="Time value"]').fill('24');
  await page.locator('xpath=//*[@aria-label="Time unit"]').selectOption('Hours');
  await page.locator('xpath=//span[contains(text(), "Apply")]').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('xpath=//div[@data-test-embeddable-id="infraAssetDetailsKPIcpuUsage"]//div[contains(@class, "echChartContent")]')).toBeVisible();
  await expect(page.locator('xpath=//div[@data-test-embeddable-id="infraAssetDetailsMetricsChartmemoryUsage"]//div[contains(@class, "echChartContent")]')).toBeVisible();
  await page.waitForLoadState('networkidle');

  // Returns back to Observability > Infrastructure > Inventory.
  await page.getByTestId('euiFlyoutCloseButton').click();

  // Selects "Pods" as "Show" option.
  await page.getByTestId('openInventorySwitcher').click();
  await page.getByTestId('goToPods').click();

  // Clicks on the tile of some pod, then clicks on the "Kubernetes Pod metrics" link.
  await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]').hover();
  await page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]/span[1]/div[@data-test-subj="nodeContainer"][1]').click({ force: true });
  await page.locator('xpath=//*[contains(text(),"Kubernetes Pod metrics")]').click();

  // Filters data by last 24 hours.
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.locator('xpath=//input[@aria-label="Time value"]').fill('24');
  await page.locator('xpath=//*[@aria-label="Time unit"]').selectOption('Hours');
  await page.locator('xpath=//span[contains(text(), "Apply")]').click();
  await expect(page.locator('xpath=//div[@id="podCpuUsage"]//div[contains(@class, "echChartContent")]')).toBeVisible();

  // Navigates to Observability > Infrastructure > Hosts.
  await page.getByRole('link', { name: 'Hosts' }).click();
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.locator('xpath=//input[@aria-label="Time value"]').fill('24');
  await page.locator('xpath=//*[@aria-label="Time unit"]').selectOption('Hours');
  await page.locator('xpath=//span[contains(text(), "Apply")]').click();
  await expect(page.locator('xpath=//div[@data-test-embeddable-id="hostsViewKPI-cpuUsage"]//div[contains(@class, "echChartContent")]')).toBeVisible();

  // Clicks on the "Logs" tab, filters logs by searching "error".
  await page.getByTestId('hostsView-tabs-logs').click();
  await page.locator('xpath=//input[@placeholder="Search for log entries..."]').fill('error');

  // Clicks on the "Open in Logs"
  await page.locator('xpath=//*[contains(text(),"Open in Logs")]').click();
  await page.waitForLoadState('networkidle');
  await page.getByTestId('superDatePickerToggleQuickMenuButton').click();
  await page.locator('xpath=//input[@aria-label="Time value"]').fill('24');
  await page.locator('xpath=//*[@aria-label="Time unit"]').selectOption('Hours');
  await page.locator('xpath=//span[contains(text(), "Apply")]').click();
  await expect(page.locator('xpath=//div[@id="podCpuUsage"]//div[contains(@class, "echChartContent")]')).toBeVisible();
  await page.waitForLoadState('networkidle');
});