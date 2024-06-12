import { test } from '../../tests/fixtures/stateful/basePage';
import { expect } from "@playwright/test";

test.beforeEach(async ({ landingPage, page }) => {
  await landingPage.goto();
  if (landingPage.spaceSelector()) {
    await page.locator('xpath=//a[contains(text(),"Default")]').click();
    await expect(page.locator('xpath=//a[@aria-label="Elastic home"]')).toBeVisible();
  };
  await page.goto('/app/observability-logs-explorer/dataset-quality');
});

test('Logs Explorer - Datasets', async ({ datasetsPage }) => { 
    await test.step('pageContentLoading', async () => {
        await datasetsPage.assertVisibilityQualityStatistics();
        await datasetsPage.assertVisibilityStatistics();
        await datasetsPage.assertVisibilityTable();
    });
});