import { Page } from "@playwright/test";

export default class ManagementPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public async goto() {
        await this.page.goto('/');
    }

    private readonly savedObjects = () => this.page.locator('xpath=//a[contains(text(),"Saved Objects")]');
    private readonly importButton = () => this.page.getByRole('button', { name: 'Import' });
    private readonly setInputFiles = () => this.page.locator('xpath=//input[@type="file"]');
    private readonly importButtonFlyout = () => this.page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Import")]');
    private readonly doneButtonFlyout = () => this.page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Done")]');

    public async clickSavedObjects() {
        await this.savedObjects().click();
        }

    public async clickImportButton() {
        await this.importButton().click();
        }

    public async uploadDashboards(input: string) {
        await this.importButton().click();
        await this.setInputFiles().setInputFiles(input);
        await this.importButtonFlyout().click();
        await this.doneButtonFlyout().click();
        }
}