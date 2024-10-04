import { expect, Page } from "@playwright/test";

export default class OnboardingPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly useCaseLogs = () => this.page.locator('xpath=//div[@data-test-subj="observabilityOnboardingUseCaseCard-logs"]//input[@type="radio"]');
    private readonly logsAutoDetect = () => this.page.locator('xpath=//button[contains(text(), "Auto-detect logs and metrics")]');
    private readonly codeBlock = () => this.page.locator('xpath=//code[@data-code-language="text"]');
    private readonly copyToClipboardButton = () => this.page.getByTestId('observabilityOnboardingCopyToClipboardButton');
    private readonly inProgressIndicator = () => this.page.locator('xpath=//div[contains(text(), "Waiting for installation to complete...")]');
    private readonly receivedDataIndicator = () => this.page.locator('xpath=//div[contains(text(), "Your data is ready to explore!")]');
    private readonly actionLinkSystem = () => this.page.locator('xpath=//a[contains(@data-test-subj, "observabilityOnboardingDataIngestStatusActionLink-system")]');

    public async selectCollectLogs() {
        await this.useCaseLogs().click();
        }

    public async selectLogsAutoDetect() {
        await this.logsAutoDetect().click();
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