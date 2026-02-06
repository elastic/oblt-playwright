import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

export default class Notifications extends BasePage {

    private readonly errorFetchingResource = () => this.page.locator('xpath=//div[@data-test-subj="globalToastList"]//*[text()="Error while fetching resource"]');
    private readonly errorIncrementCount = () => this.page.locator(`xpath=//p[@data-test-subj="errorToastMessage"]//*[contains(text(),"already closed, can't increment ref count")]`);

    public async assertErrorFetchingResource() {
        await expect(this.errorFetchingResource(), 'Error while fetching resource').toBeVisible();
        }

    public async assertErrorIncrementCount() {
        await expect(this.errorIncrementCount(), `Error loading data in index logs-*. already closed, can't increment ref count.`).toBeVisible();
        }
}