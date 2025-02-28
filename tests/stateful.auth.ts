import { test as ess_auth, expect } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";
import { waitForOneOf } from "../src/helpers.ts";
import { KIBANA_HOST, KIBANA_USERNAME, KIBANA_PASSWORD } from '../src/env.ts';
import { logger } from '../src/logger.ts';

ess_auth('Authentication', async ({page}) => {
  logger.info(`Navigating to Kibana host`);
  await page.goto(KIBANA_HOST);
  logger.info('Waiting for login page elements to appear, filling in the username and password fields');
  await page.getByRole('button', { name: 'Log in with Elasticsearch' }).click();
  await page.getByLabel('Username').fill(KIBANA_USERNAME);
  await page.getByLabel('Password', { exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill(KIBANA_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  logger.info('Logging in to Kibana');
  const [ index ] = await waitForOneOf([
    page.locator('xpath=//div[@data-test-subj="helpMenuButton"]'),
    page.locator('xpath=//h1[contains(text(),"Select your space")]'),
    page.locator('xpath=//div[@data-test-subj="loginErrorMessage"]'),
  ]);

  const spaceSelector = index === 1;
  const isAuthenticated = index === 0;

  if (isAuthenticated) {
    logger.info('Saving authenticated state');
    await page.context().storageState({path: STORAGE_STATE});
  } else if (spaceSelector) {
    logger.info('Selecting the default Kibana space');
    await page.locator('xpath=//a[contains(text(),"Default")]').click();
    await expect(page.locator('xpath=//div[@data-test-subj="helpMenuButton"]')).toBeVisible();
    logger.info('Saving authenticated state');
    await page.context().storageState({path: STORAGE_STATE});
  } else {
    logger.error('Username or password is incorrect');
    throw new Error('Authentication is failed.');
  }
});