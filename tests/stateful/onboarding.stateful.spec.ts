import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { spaceSelectorStateful, waitForOneOf } from "../../src/helpers.ts";
import { REPORT_FILE } from '../../src/env';
const fs = require('fs');
const path = require('path');
const inputFilePath = REPORT_FILE;
const outputDirectory = path.dirname(inputFilePath);

test.beforeEach(async ({ headerBar, page, sideNav, spaceSelector }) => {
    await sideNav.goto();
    await spaceSelectorStateful(headerBar, spaceSelector);
    await page.goto('/app/observabilityOnboarding');
});

test('Auto-detect logs and metrics', async ({ headerBar, onboardingPage, page }) => {
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
    useCaseLogs ? await onboardingPage.selectCollectLogs() : await onboardingPage.selectHost();

    const [ b ] = await waitForOneOf([
        onboardingPage.streamHostLogs(),
        onboardingPage.autoDetectElasticAgent()
        ]);
    const streamHostLogs = b === 0;
    if (streamHostLogs) {
        await onboardingPage.selectStreamLogs();
        await headerBar.assertLoadingIndicator();
        await Promise.race([
            onboardingPage.codeBash(),
            onboardingPage.assertErrorFetchingResource().then(() => {
            throw new Error('Test is failed due to an error while fetching resource.');
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
            clipboardData = await page.evaluate("navigator.clipboard.readText()");
            fs.writeFileSync(outputPath, clipboardData);
            await onboardingPage.assertReceivedDataIndicator();
        };
})