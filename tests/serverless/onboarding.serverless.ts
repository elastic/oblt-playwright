import { test } from '../../src/fixtures/serverless/page.fixtures.ts';
import { fetchClusterData, spaceSelectorServerless, waitForOneOf, writeJsonReport } from "../../src/helpers.ts";
import { REPORT_FILE } from '../../src/env.ts';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../src/logger.ts';

const outputDirectory = path.dirname(REPORT_FILE);
let clusterData: any;
const testStartTime: number = Date.now();

test.beforeAll('Fetch cluster data', async ({}) => {
  logger.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ page, sideNav, spaceSelector }) => {
    await sideNav.goto();
    logger.info('Selecting the default Kibana space');
    await spaceSelectorServerless(sideNav, spaceSelector);
    logger.info('Navigating to the "Onboarding" section');
    await page.goto('/app/observabilityOnboarding');
});

test.afterEach('Log test results', async ({}, testInfo) => {
  await writeJsonReport(clusterData, testInfo, testStartTime);
});

test('Auto-detect logs and metrics', async ({ onboardingPage, page }) => {
    const fileName = 'code_snippet_logs_auto_detect.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries: number = 3;
    let retries: number = 0;
    let codeBlockAppeared: boolean = false;

    logger.info('Selecting "Collect logs", then "Logs auto-detect"');
    await onboardingPage.selectCollectLogs();
    await onboardingPage.selectLogsAutoDetect();
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
            throw new Error('Page content not loaded after 3 attempts');
        }
    };
    logger.info('Asserting visibility of the code block');
    await onboardingPage.assertVisibilityCodeBlock();
    logger.info('Copying the code block to the clipboard');
    await onboardingPage.copyToClipboard();
    let clipboardData: string = await page.evaluate("navigator.clipboard.readText()");
    logger.info('Writing the clipboard data to a file');
    fs.writeFileSync(outputPath, clipboardData);
    logger.info('Asserting the received data indicator');
    await onboardingPage.assertReceivedDataIndicator();
});

test('Kubernetes', async ({ onboardingPage, page }) => {
    const fileName = 'code_snippet_kubernetes.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries: number = 3;
    let retries: number = 0;
    let codeBlockAppeared: boolean = false;

    logger.info('Selecting "Monitor infrastructure", then "Kubernetes"');
    await onboardingPage.selectMonitorInfrastructure();
    await onboardingPage.selectKubernetes();
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
            throw new Error('Page content not loaded after 3 attempts');
        }
    };
    logger.info('Asserting visibility of the code block');
    await onboardingPage.assertVisibilityCodeBlock();
    logger.info('Copying the code block to the clipboard');
    await onboardingPage.copyToClipboard();
    let clipboardData: string = await page.evaluate("navigator.clipboard.readText()");
    logger.info('Writing the clipboard data to a file');
    fs.writeFileSync(outputPath, clipboardData);
    logger.info('Asserting the received data indicator');
    await onboardingPage.assertReceivedDataIndicator();
});