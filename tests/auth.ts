import { test } from '../src/pom/page.fixtures.ts';
import { expect } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";
import { testStep, waitForOneOf } from "../src/helpers/test.utils.ts";
import { fetchClusterData } from "../src/helpers/api.client.ts";
import { writeJsonReport } from "../src/helpers/reporter.ts";
import { KIBANA_HOST, KIBANA_USERNAME, KIBANA_PASSWORD } from "../src/env.ts";

let clusterData: any;
const testStartTime: string = new Date().toISOString();

test.afterAll('Print test results', async ({ log }, testInfo) => {
  const stepData = (testInfo as any).stepData;
  await writeJsonReport(log, clusterData, testInfo, testStartTime, undefined, stepData);
});

test("Authentication", async ({ page, log }, testInfo) => {
  let stepData: object[] = [];
  clusterData = await fetchClusterData();
  const buildFlavor: string | undefined = clusterData?.version?.build_flavor;

  if (!buildFlavor) {
    throw new Error("Unable to detect cluster build flavor");
  }

  log.info(`Detected build flavor: ${buildFlavor}`);

  let index: number;

  if (buildFlavor === "serverless") {
    index = await testStep('step01', stepData, page, async () => {
      log.info("Navigating to Kibana host");
      await page.goto(KIBANA_HOST);
      
      // Serverless workflow
      log.info("Waiting for login page elements to appear, filling credentials (Serverless)");
      await page.locator('[data-test-id="login-username"]').click();
      await page.locator('[data-test-id="login-username"]').fill(KIBANA_USERNAME);
      await page.locator('[data-test-id="login-password"]').click();
      await page.locator('[data-test-id="login-password"]').fill(KIBANA_PASSWORD);
      await page.locator('[data-test-id="login-button"]').click();

      log.info("Logging in to Kibana (Serverless)");
      const [result] = await waitForOneOf([
        page.locator('xpath=//a[@href="/app/discover#/"]'),
        page.locator('xpath=//h1[contains(text(),"Select your space")]'),
        page.locator('xpath=//div[@data-test-id="login-error"]'),
      ]);
      
      return result;
    }, 'Navigating to Kibana host and logging in (Serverless)');

    const spaceSelector = index === 1;
    const isAuthenticated = index === 0;

    if (isAuthenticated) {
      log.info("Saving authenticated state");
      await page.context().storageState({ path: STORAGE_STATE });
    } else if (spaceSelector) {
      log.info("Selecting the default Kibana space");
      await page.locator('xpath=//a[contains(text(),"Default")]').click();
      await expect(page.locator('xpath=//div[@id="navigation-root"]')).toBeVisible();
      log.info("Saving authenticated state");
      await page.context().storageState({ path: STORAGE_STATE });
    } else {
      log.error("Username or password is incorrect");
      throw new Error("Authentication is failed");
    }
  } else if (buildFlavor === "default") {
    index = await testStep('step01', stepData, page, async () => {
      log.info("Navigating to Kibana host");
      await page.goto(KIBANA_HOST);
      
      // ECH workflow
      log.info("Waiting for login page elements to appear, filling credentials (ECH)");
      await page.getByRole("button", { name: "Log in with Elasticsearch" }).click();
      await page.getByLabel("Username").fill(KIBANA_USERNAME);
      await page.getByLabel("Password", { exact: true }).click();
      await page.getByLabel("Password", { exact: true }).fill(KIBANA_PASSWORD);
      await page.getByRole("button", { name: "Log in" }).click();

      log.info("Logging in to Kibana (ECH)");
      const [result] = await waitForOneOf([
        page.locator('xpath=//div[@data-test-subj="helpMenuButton"]'),
        page.locator('xpath=//h1[contains(text(),"Select your space")]'),
        page.locator('xpath=//div[@data-test-subj="loginErrorMessage"]'),
      ]);
      
      return result;
    }, 'Navigating to Kibana host and logging in (ECH)');

    const spaceSelector = index === 1;
    const isAuthenticated = index === 0;

    if (isAuthenticated) {
      log.info("Saving authenticated state");
      await page.context().storageState({ path: STORAGE_STATE });
    } else if (spaceSelector) {
      log.info("Selecting the default Kibana space");
      await page.locator('xpath=//a[contains(text(),"Default")]').click();
      await expect(page.locator('xpath=//div[@data-test-subj="helpMenuButton"]').first()).toBeVisible();
      log.info("Saving authenticated state");
      await page.context().storageState({ path: STORAGE_STATE });
    } else {
      log.error("Username or password is incorrect");
      throw new Error("Authentication is failed.");
    }
  } else {
    throw new Error(`Unknown build flavor: ${buildFlavor}`);
  }

  (testInfo as any).stepData = stepData;
});
