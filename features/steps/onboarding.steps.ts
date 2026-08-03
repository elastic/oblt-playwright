import { Given, When, Then, Before, After } from './fixtures';
import { selectDefaultSpace, waitForOneOf } from 'oblt-playwright/helpers/test-utils';
import { fetchClusterData } from 'oblt-playwright/helpers/api-client';
import { writeJsonReport } from 'oblt-playwright/helpers/reporter';
import { REPORT_FILE } from 'oblt-playwright/env';
import * as fs from 'fs';
import * as path from 'path';

const outputDirectory = path.dirname(REPORT_FILE);
const CODE_SNIPPET_FILE = 'code_snippet_auto_detect.sh';
const MAX_RETRIES: number = 3;

let clusterData: any;
let scenarioStartTime: string;

Before(async ({ log }) => {
  if (!clusterData) {
    log.info('Fetching cluster data');
    clusterData = await fetchClusterData();
  }
  scenarioStartTime = new Date().toISOString();
});

After(async ({ log, $testInfo }) => {
  await writeJsonReport(log, clusterData, $testInfo, scenarioStartTime);
});

Given('I am in the default Kibana space', async ({ page, sideNav, log }) => {
  await sideNav.goto();
  log.info('Selecting the default Kibana space');
  await selectDefaultSpace(clusterData.version.build_flavor, page);
});

Given('I navigate to the Observability Onboarding section', async ({ page, log }) => {
  log.info('Navigating to the "Onboarding" section');
  await page.goto('/app/observabilityOnboarding');
});

When('I choose to onboard a host using auto-detection', async ({ onboardingPage, log }) => {
  log.info('Selecting "Collect logs", then "Logs auto-detect"');
  await onboardingPage.selectHost();
  await onboardingPage.selectAutoDetect();
});

Then('I should be given installation instructions to run on my host', async ({ onboardingPage, page, log }) => {
  log.info('Waiting for the code block to appear');
  const [c] = await waitForOneOf([
    onboardingPage.codeBlock(),
    onboardingPage.contentNotLoaded()
  ]);
  const codeNotLoaded = c === 1;
  if (codeNotLoaded) {
    log.warn('Code block not loaded. Retrying...');
    let retries: number = 0;
    let codeBlockAppeared: boolean = false;
    while (retries < MAX_RETRIES) {
      try {
        await onboardingPage.clickRetry();
        await onboardingPage.codeBlock().waitFor({ state: 'visible', timeout: 2000 });
        codeBlockAppeared = true;
        break;
      } catch {
        retries++;
        log.warn(`Code block visibility assertion attempt ${retries} failed. Retrying...`);
      }
    }
    if (!codeBlockAppeared) {
      throw new Error(`Page content not loaded after ${MAX_RETRIES} attempts`);
    }
  }
  log.info('Asserting visibility of the code block');
  await onboardingPage.assertVisibilityCodeBlock();
  log.info('Copying the code block to the clipboard');
  await onboardingPage.copyToClipboard();
  const clipboardData: string = await page.evaluate(() => navigator.clipboard.readText());
  log.info('Writing the clipboard data to a file');
  fs.writeFileSync(path.join(outputDirectory, CODE_SNIPPET_FILE), clipboardData);
});

Then('once I run them, Kibana should confirm that data is being received', async ({ onboardingPage, log }) => {
  log.info('Asserting the received data indicator');
  await onboardingPage.assertReceivedDataIndicator();
});
