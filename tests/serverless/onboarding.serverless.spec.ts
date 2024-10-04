import { test } from '../fixtures/serverless/basePage';
import { expect } from "@playwright/test";
import { waitForOneOf } from "../../src/types.ts";
const fs = require('fs');
const path = require('path');
const inputFilePath = process.env.REPORT_FILE;
const outputDirectory = path.dirname(inputFilePath);

test.beforeEach(async ({ landingPage, page }) => {
    await landingPage.goto();

    const [ index ] = await waitForOneOf([
        page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]'),
        landingPage.spaceSelector(),
        ]);
    const spaceSelector = index === 1;
    if (spaceSelector) {
        await page.locator('xpath=//a[contains(text(),"Default")]').click();
        await expect(page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]')).toBeVisible();
        };

    await page.goto('/app/observabilityOnboarding');
});

test('Auto-detect logs and metrics', async ({ onboardingPage, page }) => {
    const fileName = 'code_snippet_logs_auto_detect.sh';
    const outputPath = path.join(outputDirectory, fileName);

    await onboardingPage.selectCollectLogs();
    await onboardingPage.selectLogsAutoDetect();
    await onboardingPage.assertVisibilityCodeBlock();
    await onboardingPage.copyToClipboard();
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    fs.writeFileSync(outputPath, clipboardData);
    await onboardingPage.assertInProgressIndicator();
    await onboardingPage.assertReceivedDataIndicator();
    await onboardingPage.exploreMetricsSystem();
});