import { test as serverless_auth } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";
import { waitForOneOf } from "../src/types.ts";

serverless_auth('Authentication', async ({page}) => {
  await page.goto(process.env.ELASTIC_URL);
  console.log(`...waiting for login page elements to appear.`);
  await page.getByTestId('login-username').click();
  await page.getByTestId('login-username').fill(process.env.ELASTIC_USERNAME);
  await page.getByTestId('login-password').click();
  await page.getByTestId('login-password').fill(process.env.ELASTIC_PASSWORD);
  await page.getByTestId('login-button').click();
  
  const [ index ] = await waitForOneOf([
    page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]'),
    page.locator('xpath=//div[@data-test-id="login-error"]'),
  ]);
  const isAuthenticated = index === 0;
  if (isAuthenticated) {
    await page.context().storageState({path: STORAGE_STATE});
  } else {
    console.log('Username or password is incorrect.');
    throw new Error('Authentication is failed.');
  }
});