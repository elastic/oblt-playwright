import { expect, Page } from "@playwright/test";

export default class OnboardingPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public readonly useCaseHost = () => this.page.locator('xpath=//div[@data-test-subj="observabilityOnboardingUseCaseCard-host"]//input[@type="radio"]');
    public readonly useCaseKubernetes = () => this.page.locator('xpath=//div[@data-test-subj="observabilityOnboardingUseCaseCard-kubernetes"]//input[@type="radio"]');
    public readonly autoDetectElasticAgent = () => this.page.getByTestId('integration-card:auto-detect-logs');
    private readonly kubernetesQuickStartCard = () => this.page.locator('xpath=//div[@data-test-subj="integration-card:kubernetes-quick-start"]');
    public readonly contentNotLoaded = () => this.page.locator('xpath=//h2[contains(text(),"Unable to load content")]');
    private readonly retryButton = () => this.page.getByTestId('observabilityOnboardingAutoDetectPanelGoBackButton');
    public readonly codeBlock = () => this.page.locator('xpath=//code[@data-code-language="text"]');
    private readonly copyToClipboardButton = () => this.page.getByTestId('observabilityOnboardingCopyToClipboardButton');
    private readonly inProgressIndicator = () => this.page.locator('xpath=//div[contains(text(), "Waiting for installation to complete...")]');
    private readonly receivedDataIndicator = () => this.page.locator('xpath=//div[contains(text(), "Your data is ready to explore!")]');
    private readonly receivedDataIndicatorKubernetes = () => this.page.locator('xpath=//div[contains(text(), "We are monitoring your cluster")]');
    private readonly actionLinkSystem = () => this.page.locator('xpath=//a[contains(@data-test-subj, "observabilityOnboardingDataIngestStatusActionLink-system")]');
    private readonly autoDetectSystemIntegrationActionLink = () => this.page.locator('xpath=//a[@data-test-subj="observabilityOnboardingDataIngestStatusActionLink-inventory-host-details"]');
    private readonly kubernetesAgentExploreDataActionLink = () => this.page.locator('xpath=//a[@data-test-subj="observabilityOnboardingDataIngestStatusActionLink-kubernetes-f4dc26db-1b53-4ea2-a78b-1bfab8ea267c"]');

    public async selectHost() {
        await this.useCaseHost().click();
    }

    public async selectKubernetesUseCase() {
        await this.useCaseKubernetes().click();
    }

    public async selectAutoDetectWithElasticAgent() {
        await this.autoDetectElasticAgent().click();
    }

    public async clickRetry() {
        await this.retryButton().click();
        }

    public async selectKubernetesQuickstart() {
        await this.kubernetesQuickStartCard().click();
    }

    public async copyToClipboard() {
        await this.copyToClipboardButton().click();
        }

    public async exploreMetricsSystem() {
        await this.actionLinkSystem().click();
        }

    public async assertVisibilityCodeBlock() {
        await expect(this.codeBlock(), 'Code block should be visible').toBeVisible();
        }

    public async assertInProgressIndicator() {
        await expect(this.inProgressIndicator(), 'In progress indicator should be visible').toBeVisible();
        }

    public async assertReceivedDataIndicator() {
        await expect(this.receivedDataIndicator(), 'Received data indicator should be visible').toBeVisible();
        }

    public async assertReceivedDataIndicatorKubernetes() {
        await expect(this.receivedDataIndicatorKubernetes(), 'Received data indicator should be visible').toBeVisible();
    }

    public async clickAutoDetectSystemIntegrationCTA() {
        await this.autoDetectSystemIntegrationActionLink().click();
    }

    public async clickKubernetesAgentCTA() {
        await this.kubernetesAgentExploreDataActionLink().click();
    }
}
