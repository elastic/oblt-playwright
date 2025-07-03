import { expect, Page } from "@playwright/test";

export default class HeaderBar {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly loadingIndicator = () => this.page.locator('xpath=//*[@data-test-subj="globalLoadingIndicator"]');

    public async assertLoadingIndicator() {
        await expect(this.loadingIndicator(), 'Loading indicator').toBeHidden();
        }

    public async assertVisibleLoadingIndicator() {
        await expect(this.loadingIndicator(), 'Loading indicator').toBeVisible();
        }
}