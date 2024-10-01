import { test } from '../../tests/fixtures/serverless/basePage';
import { expect } from '@playwright/test';
import { waitForOneOf } from "../../src/types.ts";

test.beforeAll(async ({browser}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('xpath=//button[@aria-controls="project_settings_project_nav"][2]').click();
  await page.locator('xpath=//span[contains(text(),"Management")]').click();
  await page.locator('xpath=//a[contains(text(),"Saved Objects")]').click();
  await page.locator('xpath=//input[@data-test-subj="savedObjectSearchBar"]').fill('Playwright');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  const noItems = await page.locator('xpath=//div[@data-test-subj="savedObjectsTable"]//span[contains(text(), "No items found")]').isVisible();
  if (noItems) {
    await page.getByRole('button', { name: 'Import' }).click();
    await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/dashboards.ndjson');
    await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Import")]').click();
    await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Done")]').click();
  } else {
    console.log('Dashboards already exist.')
  }
  await context.close();
});

test.beforeEach(async ({ landingPage, page }) => {
  await page.goto('/');
  const [index] = await waitForOneOf([
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

test('Average container CPU core usage', async ({ page, dashboardPage, datePicker }) => {
  const title = "Average container CPU core usage in ns";

  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await datePicker.setPeriod();
  await dashboardPage.assertVisibilityVisualization(title);
  //await dashboardPage.logVisualizationRequest(title);
});

test('Average container memory usage in bytes', async ({ page, dashboardPage, datePicker }) => {
  const title = "Average container memory usage in bytes";

  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await datePicker.setPeriod();
  await dashboardPage.assertVisibilityVisualization(title);
  //await dashboardPage.logVisualizationRequest(title);
});

test('CPU usage per container of the total node cpu', async ({ page, dashboardPage, datePicker }) => {
  const title = "CPU usage per container of the total node cpu";

  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await datePicker.setPeriod();
  await dashboardPage.assertVisibilityVisualization(title);
  //await dashboardPage.logVisualizationRequest(title);
});

test('CPU usage per pod of the total node cpu', async ({ page, dashboardPage, datePicker }) => {
  const title = "CPU usage per pod of the total node cpu";

  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await datePicker.setPeriod();
  await dashboardPage.assertVisibilityVisualization(title);
  //await dashboardPage.logVisualizationRequest(title);
});

test('Memory usage per container of the total node memory', async ({ page, dashboardPage, datePicker }) => {
  const title = "Memory usage per container of the total node memory";

  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await datePicker.setPeriod();
  await dashboardPage.assertVisibilityVisualization(title);
  //await dashboardPage.logVisualizationRequest(title);
});

test('Memory usage per pod of the total node memory', async ({ page, dashboardPage, datePicker }) => {
  const title = "Memory usage per pod of the total node memory";

  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await datePicker.setPeriod();
  await dashboardPage.assertVisibilityVisualization(title);
  //await dashboardPage.logVisualizationRequest(title);
});

test('Percentile CPU Usage per container', async ({ page, dashboardPage, datePicker }) => {
  const title = "Percentile CPU Usage per container";

  await dashboardPage.assertVisibilityHeading();
  await dashboardPage.assertVisibilityTable();
  await page.getByRole('link', { name: title }).click();
  await datePicker.setPeriod();
  await dashboardPage.assertVisibilityVisualization(title);
  //await dashboardPage.logVisualizationRequest(title);
});