import { expect, Page } from "@playwright/test";

export default class LogsExplorerPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    logsSearchField = () => this.page.getByPlaceholder('Search field names');
    fieldToggleError = () => this.page.getByTestId('fieldToggle-error.message');
    //logsDataGridRow = () => this.page.locator('xpath=//div[@data-grid-row-index="1"]//button');
    logsDataGridRow = () => this.page.locator('xpath=//div[@data-grid-row-index="0"]');

    public async filterLogsByError() {
        await this.logsSearchField().click();
        await this.logsSearchField().fill('error');
        await this.fieldToggleError().click();
        }

    public async expandLogsDataGridRow() {
        await this.logsDataGridRow().click();
        }

    public async assertDataGridRowVisibility() {
        await expect(this.logsDataGridRow()).toBeVisible();
        }
}