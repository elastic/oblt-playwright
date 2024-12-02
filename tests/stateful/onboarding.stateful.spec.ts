import { expect } from "@playwright/test";
import { test } from '../fixtures/stateful/basePage.ts';
import { spaceSelectorStateful, waitForOneOf } from "../../src/helpers.ts";
import HostsPage from './pom/pages/hosts.page.ts';
const fs = require('fs');
const path = require('path');
const inputFilePath = process.env.REPORT_FILE;
const outputDirectory = path.dirname(inputFilePath);

test.beforeEach(async ({ headerBar, page, sideNav, spaceSelector }) => {
    await sideNav.goto();
    await spaceSelectorStateful(headerBar, spaceSelector);
    await page.goto(`${process.env.KIBANA_HOST}/app/observabilityOnboarding`);
});

test('Auto-detect logs and metrics', async ({ headerBar, onboardingPage, page }) => {
    const fileName = 'code_snippet_logs_auto_detect.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries = 3;
    let retries = 0;
    let codeBlockAppeared = false;
    let clipboardData;

    await onboardingPage.selectHost();
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
    await onboardingPage.clickAutoDetectSystemIntegrationCTA();

    const hostsPage = new HostsPage(await page.waitForEvent('popup'));

    /**
     * There is a glitch on the Hosts page where it can show "No data"
     * screen even though data is available and it can show it with a delay
     * after the Hosts page layout was loaded. This workaround waits for
     * the No Data screen to be visible, and if so - reloads the page.
     * If the No Data screen does not appear, the test can proceed normally.
     * Seems like some caching issue with the Hosts page.
     */
    try {
        await hostsPage.noData().waitFor({ state: 'visible', timeout: 10000 });
        await hostsPage.page.reload();
    } catch {}

    await hostsPage.clickHostDetailsLogsTab();
    await hostsPage.assertHostDetailsLogsStream()
});

/**
 * Skipping for now as the infrastructure is not ready yet
 * to run the test in CI.
 */
test.skip('Kubernetes', async ({ onboardingPage, page, kubernetesOverviewDashboardPage }) => {
    const fileName = 'code_snippet_kubernetes.sh';
    const outputPath = path.join(outputDirectory, fileName);
    let maxRetries = 3;
    let retries = 0;
    let codeBlockAppeared = false;

    await onboardingPage.selectKubernetesUseCase();
    await onboardingPage.selectKubernetesQuickstart();

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
    await onboardingPage.assertReceivedDataIndicatorKubernetes();

    await onboardingPage.clickKubernetesAgentCTA();

    await kubernetesOverviewDashboardPage.openNodesInspector()
    await kubernetesOverviewDashboardPage.assetNodesInspectorStatusTableCells()
});
