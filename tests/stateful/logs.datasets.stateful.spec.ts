import { test } from '../../tests/fixtures/stateful/basePage';
import { expect } from "@playwright/test";
import { waitForOneOf } from "../../src/types.ts";

test.beforeEach(async ({ landingPage, page }) => {
  await landingPage.goto();

  const [ index ] = await waitForOneOf([
    page.locator('xpath=//a[@aria-label="Elastic home"]'),
    landingPage.spaceSelector(),
    ]);
  const spaceSelector = index === 1;
  if (spaceSelector) {
      await page.locator('xpath=//a[contains(text(),"Default")]').click();
      await expect(page.locator('xpath=//a[@aria-label="Elastic home"]')).toBeVisible();
    };
  await page.goto('/app/management/data/data_quality');
});

test('Logs Explorer - Datasets', async ({ datasetsPage }) => { 
    await test.step('pageContentLoading', async () => {
        await datasetsPage.assertVisibilityQualityStatistics();
        await datasetsPage.assertVisibilityStatistics();
        await datasetsPage.assertVisibilityTable();
    });
});