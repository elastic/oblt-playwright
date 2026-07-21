import { test } from 'oblt-playwright/pom/page-fixtures';
import { selectDefaultSpace, waitForOneOf } from 'oblt-playwright/helpers/test-utils';
import { fetchClusterData } from 'oblt-playwright/helpers/api-client';
import { writeJsonReport } from 'oblt-playwright/helpers/reporter';
import { REPORT_FILE } from 'oblt-playwright/env';
import * as fs from 'fs';
import * as path from 'path';

const outputDirectory = path.dirname(REPORT_FILE);
let clusterData: any;
const testStartTime: string = new Date().toISOString();

test.beforeAll('Fetch cluster data', async ({ log }) => {
  log.info('Fetching cluster data');
  clusterData = await fetchClusterData();
});

test.beforeEach(async ({ page, sideNav, log }) => {
    await sideNav.goto();
    log.info('Selecting the default Kibana space');
    await selectDefaultSpace(clusterData.version.build_flavor, page);
    log.info('Navigating to the "Onboarding" section');
    await page.goto('/app/observabilityOnboarding');
});

test.afterEach('Log test results', async ({ log }, testInfo) => {
  await writeJsonReport(log, clusterData, testInfo, testStartTime);
});

test('Auto-detect logs and metrics', async ({ onboardingPage, page, log }) => {
    const fileName = 'code_snippet_auto_detect.sh';
    const outputPath = path.join(outputDirectory, fileName);
    const maxRetries: number = 3;
    let retries: number = 0;
    let codeBlockAppeared: boolean = false;

    log.info('Selecting "Collect logs", then "Logs auto-detect"');
    await onboardingPage.selectHost();
    await onboardingPage.selectAutoDetect();
    log.info('Waiting for the code block to appear');
    const [ c ] = await waitForOneOf([
        onboardingPage.codeBlock(),
        onboardingPage.contentNotLoaded()
        ]);
    const codeNotLoaded = c === 1;
    if (codeNotLoaded) {
        log.warn('Code block not loaded. Retrying...');
        while (retries < maxRetries) {
            try {
                await onboardingPage.clickRetry();
                await onboardingPage.codeBlock().waitFor({state: 'visible', timeout: 2000});
                codeBlockAppeared = true;
                break;
            } catch {
                retries++;
                log.warn(`Code block visibility assertion attempt ${retries} failed. Retrying...`);
            }
        }
        if (!codeBlockAppeared) {
            throw new Error('Page content not loaded after 3 attempts');
        }
    }
    log.info('Asserting visibility of the code block');
    await onboardingPage.assertVisibilityCodeBlock();
    log.info('Copying the code block to the clipboard');
    await onboardingPage.copyToClipboard();
    const clipboardData: string = await page.evaluate(() => navigator.clipboard.readText());
    log.info('Writing the clipboard data to a file');
    fs.writeFileSync(outputPath, clipboardData);
    log.info('Asserting the received data indicator');
    await onboardingPage.assertReceivedDataIndicator();
});
