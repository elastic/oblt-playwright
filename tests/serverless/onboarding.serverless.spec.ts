import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { spaceSelectorServerless, waitForOneOf } from "../../src/helpers.ts";
import { REPORT_FILE } from '../../src/env.ts';
import * as fs from 'fs';
import * as path from 'path';
const outputDirectory = path.dirname(REPORT_FILE);

test.beforeEach(async ({ page, sideNav, spaceSelector }) => {
    await sideNav.goto();
    await spaceSelectorServerless(sideNav, spaceSelector);
    await page.goto('/app/observabilityOnboarding');
});

test('Auto-detect logs and metrics', async ({ onboardingPage, page }) => {
    const fileName = 'code_snippet_logs_auto_detect.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries: number = 3;
    let retries: number = 0;
    let codeBlockAppeared: boolean = false;

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
    let clipboardData: string = await page.evaluate("navigator.clipboard.readText()");
    fs.writeFileSync(outputPath, clipboardData);
    await onboardingPage.assertReceivedDataIndicator();
});

test('Kubernetes', async ({ onboardingPage, page }) => {
    const fileName = 'code_snippet_kubernetes.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries: number = 3;
    let retries: number = 0;
    let codeBlockAppeared: boolean = false;

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
    let clipboardData: string = await page.evaluate("navigator.clipboard.readText()");
    fs.writeFileSync(outputPath, clipboardData);
    await onboardingPage.assertReceivedDataIndicator();
});