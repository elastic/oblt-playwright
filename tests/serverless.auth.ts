import { expect, test as serverless_auth } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";

serverless_auth('Authentication', async ( {page} ) => {
  await page.goto(process.env.ELASTIC_URL);
  console.log(`...waiting for login page elements to appear.`);
  await page.getByTestId('login-username').click();
  await page.getByTestId('login-username').fill(process.env.ELASTIC_USERNAME);
  await page.getByTestId('login-password').click();
  await page.getByTestId('login-password').fill(process.env.ELASTIC_PASSWORD);
  await page.getByTestId('login-button').click();
  console.log(`...waiting for page to have 'Onboarding - Elastic' title.`);
  await expect(page, 'User is authenticated').toHaveTitle('Onboarding - Elastic');
  await page.context().storageState({path: STORAGE_STATE});
});