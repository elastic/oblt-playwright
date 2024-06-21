import {test} from '../../tests/fixtures/serverless/basePage';
import {expect} from '@playwright/test';
import { waitForOneOf } from "../../src/types.ts";

test.beforeAll(async ({ page }) => {
  // Navigates to Project Settings > Management > Saved Objects.
  await page.locator('xpath=//button[@aria-controls="project_settings_project_nav"][2]').click();
  await page.locator('xpath=//div[@id="project_settings_project_nav"]//span[contains(text(),"Management")]').click();
  await expect(page.locator('xpath=//a[contains(text(),"Saved Objects")]')).toBeVisible();
  await page.locator('xpath=//a[contains(text(),"Saved Objects")]').click();

  // Uploads dashboards.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/dashboards.ndjson');
  await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Import")]').click();
  await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Done")]').click();
});

test.beforeEach(async ({ landingPage, page }) => {
  await page.goto('/');
  const [ index ] = await waitForOneOf([
    page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]'),
    landingPage.spaceSelector(),
    ]);
  const spaceSelector = index === 1;
  if (spaceSelector) {
    await page.locator('xpath=//a[contains(text(),"Default")]').click();
    await expect(page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]')).toBeVisible();
    };
  await page.goto('/app/dashboards');
});

test('Average container CPU core usage', async ({page, dashboardPage, datePicker}) => {
  const name = "Average container CPU core usage";
  const title = "[Playwright Test] Average container CPU core usage in ns";

  // Navigates to Dashboards, opens "Average container CPU core usage in ns" dashboard.
  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await dashboardPage.assertVisibilityVisualization(title);
  await dashboardPage.clickOptions();
  await dashboardPage.openRequestsView();
  await dashboardPage.logRequestTime(name);
  await dashboardPage.logQueryTime(name);

  // Logs Elasticsearch query.
  await dashboardPage.queryToClipboard();
  await dashboardPage.logQuery(name);
  await dashboardPage.closeFlyout();
});

test('Average container memory usage in bytes', async ({page, dashboardPage, datePicker}) => {
  const name = "Average container memory usage in bytes";
  const title = "[Playwright Test] Average container memory usage in bytes";

  // Navigates to Dashboards, opens "Average container memory usage in bytes" dashboard.
  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await dashboardPage.assertVisibilityVisualization(title);
  await dashboardPage.clickOptions();
  await dashboardPage.openRequestsView();
  await dashboardPage.logRequestTime(name);
  await dashboardPage.logQueryTime(name);

  // Logs Elasticsearch query.
  await dashboardPage.queryToClipboard();
  await dashboardPage.logQuery(name);
  await dashboardPage.closeFlyout();
});

test('CPU usage per container of the total node cpu', async ({page, dashboardPage, datePicker}) => {
  const name = "CPU usage per container of the total node cpu";
  const title = "[Playwright Test] CPU usage per container of the total node cpu";

  // Navigates to Dashboards, opens "CPU usage per container of the total node cpu" dashboard.
  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await dashboardPage.assertVisibilityVisualization(title);
  await dashboardPage.clickOptions();
  await dashboardPage.openRequestsView();
  await dashboardPage.logRequestTime(name);
  await dashboardPage.logQueryTime(name);
  
  // Logs Elasticsearch query.
  await dashboardPage.queryToClipboard();
  await dashboardPage.logQuery(name);
  await dashboardPage.closeFlyout();
});

test('CPU usage per pod of the total node cpu', async ({page, dashboardPage, datePicker}) => {
  const name = "CPU usage per pod of the total node cpu";
  const title = "[Playwright Test] CPU usage per pod of the total node cpu";

  // Navigates to Dashboards, opens "CPU usage per pod of the total node cpu" dashboard.
  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await dashboardPage.assertVisibilityVisualization(title);
  await dashboardPage.clickOptions();
  await dashboardPage.openRequestsView();
  await dashboardPage.logRequestTime(name);
  await dashboardPage.logQueryTime(name);
  
  // Logs Elasticsearch query.
  await dashboardPage.queryToClipboard();
  await dashboardPage.logQuery(name);
  await dashboardPage.closeFlyout();
});

test('Memory usage per container of the total node memory', async ({page, dashboardPage, datePicker}) => {
  const name = "Memory usage per container of the total node memory";
  const title = "[Playwright Test] Memory usage per container of the total node memory";

  // Navigates to Dashboards, opens "Memory usage per container of the total node memory" dashboard.
  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await dashboardPage.assertVisibilityVisualization(title);
  await dashboardPage.clickOptions();
  await dashboardPage.openRequestsView();
  await dashboardPage.logRequestTime(name);
  await dashboardPage.logQueryTime(name);
  
  // Logs Elasticsearch query.
  await dashboardPage.queryToClipboard();
  await dashboardPage.logQuery(name);
  await dashboardPage.closeFlyout();
});

test('Memory usage per pod of the total node memory', async ({page, dashboardPage, datePicker}) => {
  const name = "Memory usage per pod of the total node memory";
  const title = "[Playwright Test] Memory usage per pod of the total node memory";

  // Navigates to Dashboards, opens "Memory usage per pod of the total node memory" dashboard.
  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await dashboardPage.assertVisibilityVisualization(title);
  await dashboardPage.clickOptions();
  await dashboardPage.openRequestsView();
  await dashboardPage.logRequestTime(name);
  await dashboardPage.logQueryTime(name);
  
  // Logs Elasticsearch query.
  await dashboardPage.queryToClipboard();
  await dashboardPage.logQuery(name);
  await dashboardPage.closeFlyout();
});

test('Percentile CPU Usage per container', async ({page, dashboardPage, datePicker}) => {
  const name = "Percentile CPU Usage per container";
  const title = "[Playwright Test] Percentile CPU Usage per container";

  // Navigates to Dashboards, opens "Percentile CPU Usage per container" dashboard.
  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await page.waitForLoadState('networkidle');

  // Filters data by selected date picker option, gets visualization load time.
  await datePicker.clickDatePicker();
  await datePicker.selectDate();
  await dashboardPage.assertVisibilityVisualization(title);
  await dashboardPage.clickOptions();
  await dashboardPage.openRequestsView();
  await dashboardPage.logRequestTime(name);
  await dashboardPage.logQueryTime(name);
  
  // Logs Elasticsearch query.
  await dashboardPage.queryToClipboard();
  await dashboardPage.logQuery(name);
  await dashboardPage.closeFlyout();
});