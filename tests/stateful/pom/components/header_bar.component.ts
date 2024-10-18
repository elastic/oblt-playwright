import { expect, Page } from "@playwright/test";

export default class HeaderBar {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly loadingIndicator = () => this.page.locator('xpath=//*[@data-test-subj="globalLoadingIndicator"]');
    public readonly logo = () => this.page.locator('xpath=//a[@aria-label="Elastic home"]');

    public async assertLoadingIndicator() {
        await expect(this.loadingIndicator(), 'Loading indicator').toBeHidden();
        }

    public async assertLogo() {
        await expect(this.logo(), 'Elastic logo').toBeHidden();
        }
}