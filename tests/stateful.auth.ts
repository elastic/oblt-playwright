import { test as ess_auth } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";
import { waitForOneOf } from "../src/types.ts";

ess_auth('Authentication', async ({page}) => {
  await page.goto(process.env.KIBANA_HOST);
  console.log(`...waiting for login page elements to appear.`);
  await page.getByRole('button', { name: 'Log in with Elasticsearch' }).click();
  await page.getByLabel('Username').fill(process.env.KIBANA_USERNAME);
  await page.getByLabel('Password', { exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill(process.env.KIBANA_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();

  const [ index, locator ] = await waitForOneOf([
    page.locator('xpath=//a[@aria-label="Elastic home"]'),
    page.locator('xpath=//div[@data-test-subj="loginErrorMessage"]'),
  ]);
  console.log([ index, locator ]);
  const isAuthenticated = index === 0;
  if (isAuthenticated) {
    await page.context().storageState({path: STORAGE_STATE});
  } else {
    console.log('Username or password is incorrect.');
    throw new Error('Authentication is failed.');
  }
});