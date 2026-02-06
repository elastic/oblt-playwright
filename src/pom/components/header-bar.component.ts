import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

export default class HeaderBar extends BasePage {

    private readonly loadingIndicator = () => this.page.locator('xpath=//*[@data-test-subj="globalLoadingIndicator"]');

    public async assertLoadingIndicator() {
        await expect(this.loadingIndicator(), 'Loading indicator').toBeHidden();
        }

    public async assertVisibleLoadingIndicator() {
        await expect(this.loadingIndicator(), 'Loading indicator').toBeVisible();
        }
}