import { expect, test as ess_setup } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";

ess_setup('Authentication & Setup', async ({page}) => {
  await page.goto(process.env.ELASTIC_URL);
  await page.getByRole('button', { name: 'Log in with Elasticsearch' }).click();
  await page.getByLabel('Username').fill(process.env.ELASTIC_USERNAME);
  await page.getByLabel('Password', { exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill(process.env.ELASTIC_PASSWORD, { timeout: 20000});
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveTitle('Home - Elastic', { timeout: 50000});
  await page.context().storageState({path: STORAGE_STATE});

  // Navigates to Observability > Stack Management > Saved Objects.
  await page.getByTestId('toggleNavButton').click();
  await page.getByTestId('homeLink').click();
  await page.getByTestId('homeManage').click();
  await expect(page.locator('xpath=//span[contains(text(),"Saved Objects")]')).toBeVisible();
  await page.locator('xpath=//span[contains(text(),"Saved Objects")]').click();

  // Uploads dashboards.
  await page.getByRole('button', { name: 'Import' }).click();
  await page.locator('xpath=//input[@type="file"]').setInputFiles('./tests/fixtures/dashboards/dashboards.ndjson');
  await page.getByTestId('importSavedObjectsImportBtn').click();
  await page.getByTestId('importSavedObjectsDoneBtn').click();
});