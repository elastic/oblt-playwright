import { expect, Page } from "@playwright/test";

export default class Notifications {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly errorFetchingResource = () => this.page.locator('xpath=//div[@data-test-subj="globalToastList"]//*[text()="Error while fetching resource"]');

    public async assertErrorFetchingResource() {
        await expect(this.errorFetchingResource(), 'Error while fetching resource').toBeVisible();
        }
}