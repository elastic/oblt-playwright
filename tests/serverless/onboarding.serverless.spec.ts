import { test } from '../../src/fixtures/serverless/basePage';
import { spaceSelectorServerless, waitForOneOf } from "../../src/helpers.ts";
import { REPORT_FILE } from '../../src/env';
const fs = require('fs');
const path = require('path');
const inputFilePath = REPORT_FILE;
const outputDirectory = path.dirname(inputFilePath);

test.beforeEach(async ({ page, sideNav, spaceSelector }) => {
    await sideNav.goto();
    await spaceSelectorServerless(sideNav, spaceSelector);
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
    const [ c ] = await waitForOneOf([
        onboardingPage.codeBlock(),
        onboardingPage.contentNotLoaded()
        ]);
    const codeNotLoaded = c === 1;
    if (codeNotLoaded) {
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
    const [ c ] = await waitForOneOf([
        onboardingPage.codeBlock(),
        onboardingPage.contentNotLoaded()
        ]);
    const codeNotLoaded = c === 1;
    if (codeNotLoaded) {
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