import { test } from '../fixtures/stateful/basePage.ts';
import { expect } from "@playwright/test";
import { waitForOneOf } from "../../src/types.ts";
const fs = require('fs');
const path = require('path');
const inputFilePath = process.env.REPORT_FILE;
const outputDirectory = path.dirname(inputFilePath);

test.beforeEach(async ({ landingPage, page }) => {
    await landingPage.goto();
    
    const [ index ] = await waitForOneOf([
        page.locator('xpath=//a[@aria-label="Elastic home"]'),
        landingPage.spaceSelector(),
        ]);
    const spaceSelector = index === 1;
    if (spaceSelector) {
        await page.locator('xpath=//a[contains(text(),"Default")]').click();
        await expect(page.locator('xpath=//a[@aria-label="Elastic home"]')).toBeVisible();
        };
    
    await page.goto('/app/observabilityOnboarding');
});

test('Auto-detect logs and metrics', async ({ onboardingPage, page }) => {
    const fileName = 'code_snippet_logs_auto_detect.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries = 3;
    let retries = 0;
    let codeBlockAppeared = false;

    await onboardingPage.selectCollectLogs();
    await onboardingPage.selectLogsAutoDetect();
    if (onboardingPage.contentNotLoaded()) {
        while (retries < maxRetries) {
            try {
                onboardingPage.clickRetry();
                await onboardingPage.codeBlock().waitFor({state: 'visible', timeout: 2000});
                codeBlockAppeared = true;
                break;
            } catch (error) {
                retries++;
                console.log(`Code block visibility assertion attempt ${retries} failed. Retrying...`);
            }
        }
        if (!codeBlockAppeared) {
            throw new Error('Page content not loaded after 3 attempts.');
        }
    };
    await onboardingPage.assertVisibilityCodeBlock();
    await onboardingPage.copyToClipboard();
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    fs.writeFileSync(outputPath, clipboardData);
    await onboardingPage.assertReceivedDataIndicator();
});

test('Kubernetes', async ({ onboardingPage, page }) => {
    const fileName = 'code_snippet_kubernetes.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries = 3;
    let retries = 0;
    let codeBlockAppeared = false;

    await onboardingPage.selectMonitorInfrastructure();
    await onboardingPage.selectKubernetes();
    if (onboardingPage.contentNotLoaded()) {
        while (retries < maxRetries) {
            try {
                onboardingPage.clickRetry();
                await onboardingPage.codeBlock().waitFor({state: 'visible', timeout: 2000});
                codeBlockAppeared = true;
                break;
            } catch (error) {
                retries++;
                console.log(`Code block visibility assertion attempt ${retries} failed. Retrying...`);
            }
        }
        if (!codeBlockAppeared) {
            throw new Error('Page content not loaded after 3 attempts.');
        }
    };
    await onboardingPage.assertVisibilityCodeBlock();
    await onboardingPage.copyToClipboard();
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    fs.writeFileSync(outputPath, clipboardData);
    await onboardingPage.assertReceivedDataIndicator();
});