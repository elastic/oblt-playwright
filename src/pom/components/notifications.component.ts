import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

export default class Notifications extends BasePage {

    private readonly toastList = () => this.page.getByTestId('globalToastList');
    private readonly errorFetchingResource = () => this.toastList().getByText('Error while fetching resource', { exact: true });
    private readonly errorIncrementCount = () => this.page.locator(`xpath=//p[@data-test-subj="errorToastMessage"]//*[contains(text(),"already closed, can't increment ref count")]`);
    private readonly toast = (text: string) => this.toastList().getByText(text);

    public async assertToast(text: string) {
        await expect(this.toast(text), `"${text}" toast`).toBeVisible();
        }

    public async assertErrorFetchingResource() {
        await expect(this.errorFetchingResource(), 'Error while fetching resource').toBeVisible();
        }

    public async assertErrorIncrementCount() {
        await expect(this.errorIncrementCount(), `Error loading data in index logs-*. already closed, can't increment ref count.`).toBeVisible();
        }
        
    private readonly errorAgentDetailsUpdate = () => this.toastList().getByText('Unable to update agent details', { exact: true });

    public async assertErrorAgentDetailsUpdate() {
        await expect(this.errorAgentDetailsUpdate(), 'Unable to update agent details').toBeVisible();
    }
}