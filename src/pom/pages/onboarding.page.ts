import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

export default class OnboardingPage extends BasePage {

    private readonly useCaseHost = () => this.page.locator('xpath=//div[@data-test-subj="observabilityOnboardingUseCaseCard-host"]//input[@type="radio"]');
    private readonly autoDetect = () => this.page.locator('xpath=//button[contains(text(),"Elastic Agent: Logs & Metrics")]');
    public readonly contentNotLoaded = () => this.page.locator('xpath=//h2[contains(text(),"Unable to load content")]');
    private readonly retryButton = () => this.page.getByTestId('observabilityOnboardingAutoDetectPanelGoBackButton');
    public readonly codeBlock = () => this.page.locator('xpath=//code[@data-test-subj="observabilityOnboardingAutoDetectPanelCodeSnippet"]');
    private readonly copyToClipboardButton = () => this.page.getByTestId('observabilityOnboardingCopyToClipboardButton');
    private readonly inProgressIndicator = () => this.page.locator('xpath=//div[contains(text(), "Waiting for installation to complete...")]');
    private readonly receivedDataIndicator = () => this.page.locator('xpath=//div[contains(text(), "Your data is ready to explore!")]');
    private readonly actionLinkSystem = () => this.page.locator('xpath=//a[contains(@data-test-subj, "observabilityOnboardingDataIngestStatusActionLink-system")]');

    public async selectHost() {
        await this.useCaseHost().click();
        }
    
    public async selectAutoDetect() {
        await this.autoDetect().click();
        }

    public async clickRetry() {
        await this.retryButton().click();
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
}