import { expect, test as ess_setup } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";

ess_setup('Authentication', async ({page}) => {
  await page.goto(process.env.ELASTIC_URL);
  console.log(`...waiting for login page elements to appear.`);
  await page.getByRole('button', { name: 'Log in with Elasticsearch' }).click();
  await page.getByLabel('Username').fill(process.env.ELASTIC_USERNAME);
  await page.getByLabel('Password', { exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill(process.env.ELASTIC_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  console.log(`...waiting for page to have 'Home - Elastic' title.`);
  await expect(page, 'User is authenticated').toHaveTitle('Home - Elastic');
  await page.context().storageState({path: STORAGE_STATE});
});