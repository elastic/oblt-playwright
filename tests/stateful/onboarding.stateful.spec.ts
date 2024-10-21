import { test } from '../fixtures/stateful/basePage.ts';
import { spaceSelectorStateful, waitForOneOf } from "../../src/helpers.ts";
const fs = require('fs');
const path = require('path');
const inputFilePath = process.env.REPORT_FILE;
const outputDirectory = path.dirname(inputFilePath);

test.beforeEach(async ({ headerBar, page, sideNav, spaceSelector }) => {
    await sideNav.goto();
    await spaceSelectorStateful(headerBar, spaceSelector);
    await page.goto('/app/observabilityOnboarding');
});

test('Auto-detect logs and metrics', async ({ onboardingPage, page }) => {
    const fileName = 'code_snippet_logs_auto_detect.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries = 3;
    let retries = 0;
    let codeBlockAppeared = false;
    let clipboardData;

    const [ a ] = await waitForOneOf([
        onboardingPage.useCaseLogs(),
        onboardingPage.useCaseHost()
        ]);
    const useCaseLogs = a === 0;
    if (useCaseLogs) {
        await onboardingPage.selectCollectLogs()
        } else {
            await onboardingPage.selectHost()
        };

    const [ b ] = await waitForOneOf([
        onboardingPage.streamHostLogs(),
        onboardingPage.autoDetectElasticAgent()
        ]);
    const streamHostLogs = b === 0;
    if (streamHostLogs) {
        await onboardingPage.selectStreamLogs();
        await Promise.race([
            onboardingPage.codeBash(),
            onboardingPage.assertErrorFetchingResource().then(() => {
            throw new Error('Test is failed because due to an error while fetching resource.');
            })
        ]);
        await onboardingPage.assertSystemIntegrationInstalled();
        await onboardingPage.assertApiKeyCreated();
        await onboardingPage.clickAutoDownloadConfigButton();
        await onboardingPage.copyToClipboardCode();
        clipboardData = await page.evaluate("navigator.clipboard.readText()");
        fs.writeFileSync(outputPath, clipboardData);
        await onboardingPage.assertShippedLogs();
        } else {
            await onboardingPage.selectAutoDetectWithElasticAgent();
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
            clipboardData = await page.evaluate("navigator.clipboard.readText()");
            fs.writeFileSync(outputPath, clipboardData);
            await onboardingPage.assertReceivedDataIndicator();
        };
})