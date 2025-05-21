import { test } from '../../src/fixtures/stateful/page.fixtures.ts';
import { spaceSelectorStateful, waitForOneOf } from "../../src/helpers.ts";
import { REPORT_FILE } from '../../src/env.ts';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../src/logger.ts';

const outputDirectory = path.dirname(REPORT_FILE);

test.beforeEach(async ({ headerBar, page, sideNav, spaceSelector }) => {
    await sideNav.goto();
    logger.info('Selecting the default Kibana space');
    await spaceSelectorStateful(headerBar, spaceSelector);
    logger.info('Navigating to the "Onboarding" section');
    await page.goto('/app/observabilityOnboarding');
});

test('Auto-detect logs and metrics', async ({ headerBar, onboardingPage, page }) => {
    const fileName = 'code_snippet_logs_auto_detect.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries: number = 3;
    let retries: number = 0;
    let codeBlockAppeared: boolean = false;
    let clipboardData: string;

    logger.info('Waiting for the use case to appear');
    const [ a ] = await waitForOneOf([
        onboardingPage.useCaseLogs(),
        onboardingPage.useCaseHost()
        ]);
    const useCaseLogs = a === 0;
    logger.info('Selecting "Collect logs" or "Host"');
    useCaseLogs ? await onboardingPage.selectCollectLogs() : await onboardingPage.selectHost();

    logger.info('Waiting for the interaction card to appear');
    const [ b ] = await waitForOneOf([
        onboardingPage.streamHostLogs(),
        onboardingPage.autoDetectElasticAgent()
        ]);
    const streamHostLogs = b === 0;
    if (streamHostLogs) {
        logger.info('Selecting "Stream host logs"');
        await onboardingPage.selectStreamLogs();
        await headerBar.assertLoadingIndicator();
        logger.info('Waiting for the code block to appear');
        await Promise.race([
            onboardingPage.codeBash(),
            onboardingPage.assertErrorFetchingResource().then(() => {
                logger.error('Test is failed due to an error while fetching resource');
                throw new Error('Test is failed due to an error while fetching resource');
            })
        ]);
        logger.info('Asserting the system integration is installed and the API key is created');
        await onboardingPage.assertSystemIntegrationInstalled();
        await onboardingPage.assertApiKeyCreated();
        await onboardingPage.clickAutoDownloadConfigButton();
        logger.info('Copying the code snippet to the clipboard');
        await onboardingPage.copyToClipboardCode();
        clipboardData = await page.evaluate("navigator.clipboard.readText()");
        logger.info('Writing the clipboard data to a file');
        fs.writeFileSync(outputPath, clipboardData);
        logger.info('Asserting the received data indicator');
        await onboardingPage.assertShippedLogs();
        } else {
            logger.info('Selecting "Auto-detect with Elastic Agent"');
            await onboardingPage.selectAutoDetectWithElasticAgent();
            logger.info('Waiting for the code block to appear');
            const [ c ] = await waitForOneOf([
                onboardingPage.codeBlock(),
                onboardingPage.contentNotLoaded()
                ]);
            const codeNotLoaded = c === 1;
            if (codeNotLoaded) {
                logger.warn('Code block not loaded. Retrying...');
                while (retries < maxRetries) {
                    try {
                        onboardingPage.clickRetry();
                        await onboardingPage.codeBlock().waitFor({state: 'visible', timeout: 2000});
                        codeBlockAppeared = true;
                        break;
                    } catch (error) {
                        retries++;
                        logger.warn(`Code block visibility assertion attempt ${retries} failed. Retrying...`);
                    }
                }
                if (!codeBlockAppeared) {
                    logger.error('Page content not loaded after 3 attempts');
                    throw new Error('Page content not loaded after 3 attempts');
                }
            };
            logger.info('Asserting visibility of the code block');
            await onboardingPage.assertVisibilityCodeBlock();
            logger.info('Copying the code block to the clipboard');
            await onboardingPage.copyToClipboard();
            clipboardData = await page.evaluate("navigator.clipboard.readText()");
            logger.info('Writing the clipboard data to a file');
            fs.writeFileSync(outputPath, clipboardData);
            logger.info('Asserting the received data indicator');
            await onboardingPage.assertReceivedDataIndicator();
        };
})