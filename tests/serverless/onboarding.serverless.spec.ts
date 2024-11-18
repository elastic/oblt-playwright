import { test } from '../fixtures/serverless/basePage';
import { spaceSelectorServerless, waitForOneOf } from "../../src/helpers.ts";
import HostsPage from './pom/pages/hosts.page.ts';
import KubernetesOverviewDashboardPage from './pom/pages/kubernetes_overview_dashboard.page.ts';
const fs = require('fs');
const path = require('path');
const inputFilePath = process.env.REPORT_FILE;
const outputDirectory = path.dirname(inputFilePath);
const isLocalCluster = process.env.CLUSTER_ENVIRONMENT === 'development';

if (isLocalCluster) {
    test.use({
        ignoreHTTPSErrors: true,
    });
}

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
    let clipboardData = await page.evaluate("navigator.clipboard.readText()");
    fs.writeFileSync(outputPath, clipboardData);

    await onboardingPage.assertReceivedDataIndicator();
    await onboardingPage.clickAutoDetectSystemIntegrationCTA();

    const hostsPage = new HostsPage(await page.waitForEvent('popup'))
    await hostsPage.assertHostKPICPUPercentage()
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
