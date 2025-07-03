import { expect, Page } from "@playwright/test";

export default class HeaderBar {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly loadingIndicator = () => this.page.locator('xpath=//*[@data-test-subj="globalLoadingIndicator"]');
    public readonly helpMenuButton = () => this.page.locator('xpath=//div[@data-test-subj="helpMenuButton"]');

    public async assertLoadingIndicator() {
        await expect(this.loadingIndicator(), 'Loading indicator').toBeHidden();
        }

    public async assertVisibleLoadingIndicator() {
        await expect(this.loadingIndicator(), 'Loading indicator').toBeVisible();
        }

    public async assertHelpMenuButton() {
        await expect(this.helpMenuButton(), 'Help menu button').toBeVisible();
        }
}