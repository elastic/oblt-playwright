import { Page } from "@playwright/test";

export class SpaceSelector {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public readonly spaceSelector = () => this.page.locator('xpath=//h1[contains(text(),"Select your space")]');
    private readonly spaceSelectorDefault = () => this.page.locator('xpath=//a[contains(text(),"Default")]');

    public async selectDefault() {
        await this.spaceSelectorDefault().click();
    }
}