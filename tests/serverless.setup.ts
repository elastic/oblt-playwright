import { expect, test as serverless_setup } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";

serverless_setup('Authentication & Setup', async ( {page} ) => {
  await page.goto(process.env.ELASTIC_URL);
  await page.waitForLoadState('networkidle');
  await page.getByTestId('login-username').click();
  await page.getByTestId('login-username').fill(process.env.ELASTIC_USERNAME);
  await page.getByTestId('login-password').click();
  await page.getByTestId('login-password').fill(process.env.ELASTIC_PASSWORD);
  await page.getByTestId('login-button').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle('Elastic');
  await page.context().storageState({path: STORAGE_STATE});
  
  // Navigates to Project Settings > Management > Saved Objects.
  await page.locator('xpath=//button[@aria-controls="project_settings_project_nav"]').click();
  await page.locator('xpath=//span[contains(text(),"Management")]').click();
  await expect(page.locator('xpath=//a[contains(text(),"Saved Objects")]')).toBeVisible();
  await page.locator('xpath=//a[contains(text(),"Saved Objects")]').click();

  // Uploads dashboards.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/dashboards.ndjson');
  await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Import")]').click();
  await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Done")]').click();
});