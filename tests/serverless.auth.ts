import { test as serverless_auth } from '../src/fixtures/serverless/page.fixtures.ts';
import { expect } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";
import { waitForOneOf } from "../src/helpers.ts";
import { KIBANA_HOST, KIBANA_USERNAME, KIBANA_PASSWORD } from '../src/env.ts';
import { logger } from '../src/logger.ts';

serverless_auth('Authentication', async ({page}) => {
  logger.info(`Navigating to Kibana host`);
  await page.goto(KIBANA_HOST);
  logger.info('Waiting for login page elements to appear, filling in the username and password fields');
  await page.getByTestId('login-username').click();
  await page.getByTestId('login-username').fill(KIBANA_USERNAME);
  await page.getByTestId('login-password').click();
  await page.getByTestId('login-password').fill(KIBANA_PASSWORD);
  await page.getByTestId('login-button').click();
  logger.info('Logging in to Kibana');
  const [ index ] = await waitForOneOf([
    page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]'),
    page.locator('xpath=//h1[contains(text(),"Select your space")]'),
    page.locator('xpath=//div[@data-test-id="login-error"]'),
  ]);
  
  const spaceSelector = index === 1;
  const isAuthenticated = index === 0;

  if (isAuthenticated) {
    logger.info('Saving authenticated state');
    await page.context().storageState({path: STORAGE_STATE});
  } else if (spaceSelector) {
    logger.info('Selecting the default Kibana space');
    await page.locator('xpath=//a[contains(text(),"Default")]').click();
    await expect(page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]')).toBeVisible();
    logger.info('Saving authenticated state');
    await page.context().storageState({path: STORAGE_STATE});
  } else {
    logger.error('Username or password is incorrect');
    throw new Error('Authentication is failed');
  }
});