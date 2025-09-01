import { test, expect } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";
import { waitForOneOf, fetchClusterData } from "../src/helpers.ts";
import { KIBANA_HOST, KIBANA_USERNAME, KIBANA_PASSWORD } from "../src/env.ts";
import { logger } from "../src/logger.ts";

test("Authentication", async ({ page }) => {
  const clusterData: any = await fetchClusterData();
  const buildFlavor: string | undefined = clusterData?.version?.build_flavor;

  if (!buildFlavor) {
    throw new Error("Unable to detect cluster build flavor");
  }

  logger.info(`Detected build flavor: ${buildFlavor}`);
  logger.info("Navigating to Kibana host");
  await page.goto(KIBANA_HOST);

  if (buildFlavor === "serverless") {
    // Serverless workflow
    logger.info("Waiting for login page elements to appear, filling credentials (Serverless)");
    await page.locator('[data-test-id="login-username"]').click();
    await page.locator('[data-test-id="login-username"]').fill(KIBANA_USERNAME);
    await page.locator('[data-test-id="login-password"]').click();
    await page.locator('[data-test-id="login-password"]').fill(KIBANA_PASSWORD);
    await page.locator('[data-test-id="login-button"]').click();

    logger.info("Logging in to Kibana (Serverless)");
    const [index] = await waitForOneOf([
      page.locator('xpath=//nav[@data-test-subj="projectLayoutSideNav"]'),
      page.locator('xpath=//h1[contains(text(),"Select your space")]'),
      page.locator('xpath=//div[@data-test-id="login-error"]'),
    ]);

    const spaceSelector = index === 1;
    const isAuthenticated = index === 0;

    if (isAuthenticated) {
      logger.info("Saving authenticated state");
      await page.context().storageState({ path: STORAGE_STATE });
    } else if (spaceSelector) {
      logger.info("Selecting the default Kibana space");
      await page.locator('xpath=//a[contains(text(),"Default")]').click();
      await expect(page.locator('xpath=//nav[@data-test-subj="projectLayoutSideNav"]')).toBeVisible();
      logger.info("Saving authenticated state");
      await page.context().storageState({ path: STORAGE_STATE });
    } else {
      logger.error("Username or password is incorrect");
      throw new Error("Authentication is failed");
    }
  } else if (buildFlavor === "default") {
    // ECH workflow
    logger.info("Waiting for login page elements to appear, filling credentials (ECH)");
    await page.getByRole("button", { name: "Log in with Elasticsearch" }).click();
    await page.getByLabel("Username").fill(KIBANA_USERNAME);
    await page.getByLabel("Password", { exact: true }).click();
    await page.getByLabel("Password", { exact: true }).fill(KIBANA_PASSWORD);
    await page.getByRole("button", { name: "Log in" }).click();

    logger.info("Logging in to Kibana (ECH)");
    const [index] = await waitForOneOf([
      page.locator('xpath=//div[@data-test-subj="helpMenuButton"]'),
      page.locator('xpath=//h1[contains(text(),"Select your space")]'),
      page.locator('xpath=//div[@data-test-subj="loginErrorMessage"]'),
    ]);

    const spaceSelector = index === 1;
    const isAuthenticated = index === 0;

    if (isAuthenticated) {
      logger.info("Saving authenticated state");
      await page.context().storageState({ path: STORAGE_STATE });
    } else if (spaceSelector) {
      logger.info("Selecting the default Kibana space");
      await page.locator('xpath=//a[contains(text(),"Default")]').click();
      await expect(page.locator('xpath=//div[@data-test-subj="helpMenuButton"]').first()).toBeVisible();
      logger.info("Saving authenticated state");
      await page.context().storageState({ path: STORAGE_STATE });
    } else {
      logger.error("Username or password is incorrect");
      throw new Error("Authentication is failed.");
    }
  } else {
    throw new Error(`Unknown build flavor: ${buildFlavor}`);
  }
});
