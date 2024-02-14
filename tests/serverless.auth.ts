import { expect, test as serverless_auth } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";

serverless_auth('Authentication', async ( {page} ) => {
  await page.goto(process.env.ELASTIC_URL);
  await page.waitForLoadState('networkidle');
  await page.getByTestId('login-username').click();
  await page.getByTestId('login-username').fill(process.env.ELASTIC_USERNAME);
  await page.getByTestId('login-password').click();
  await page.getByTestId('login-password').fill(process.env.ELASTIC_PASSWORD);
  await page.getByTestId('login-button').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle('Onboarding - Elastic');
  await page.context().storageState({path: STORAGE_STATE});
});