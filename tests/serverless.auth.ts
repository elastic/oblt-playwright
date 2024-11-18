import { test as serverless_auth } from './fixtures/serverless/basePage';
import { expect } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";
import { waitForOneOf } from "../src/helpers.ts";
const isLocalCluster = process.env.CLUSTER_ENVIRONMENT === 'local';

if (isLocalCluster) {
  serverless_auth.use({
    ignoreHTTPSErrors: true,
  });
}

serverless_auth('Authentication', async ({page}) => {
  if (isLocalCluster) {
    await page.goto(`${process.env.KIBANA_HOST}/login`);
    console.log(`...waiting for login page elements to appear.`);
    await page.getByLabel('Username').fill(process.env.KIBANA_USERNAME);
    await page.getByLabel('Password', { exact: true }).click();
    await page.getByLabel('Password', { exact: true }).fill(process.env.KIBANA_PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();
  } else {
    await page.goto(process.env.KIBANA_HOST);
    console.log(`...waiting for login page elements to appear.`);
    await page.locator('xpath=//button[contains(text(), "Accept")]').click();
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill(process.env.KIBANA_USERNAME);
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill(process.env.KIBANA_PASSWORD);
    await page.getByTestId('login-button').click();
  }


  const [ index ] = await waitForOneOf([
    page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]'),
    page.locator('xpath=//h1[contains(text(),"Select your space")]'),
    page.locator('xpath=//div[@data-test-id="login-error"]'),
  ]);

  const spaceSelector = index === 1;
  const isAuthenticated = index === 0;

  if (isAuthenticated) {
    await page.context().storageState({path: STORAGE_STATE});
  } else if (spaceSelector) {
    await page.locator('xpath=//a[contains(text(),"Default")]').click();
    await expect(page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]')).toBeVisible();
    await page.context().storageState({path: STORAGE_STATE});
  } else {
    console.log('Username or password is incorrect.');
    throw new Error('Authentication is failed.');
  }
});
