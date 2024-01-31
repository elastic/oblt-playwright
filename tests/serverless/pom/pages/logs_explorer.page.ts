import { expect, Page } from "@playwright/test";

export default class LogsExplorerPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    logsExplorerTab = () => this.page.getByTestId('logExplorerTab');
    logsSearchField = () => this.page.getByPlaceholder('Search field names');
    fieldToggleError = () => this.page.getByTestId('fieldToggle-error.message');
    logsCanvas = () => this.page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]');
    logsDataGridRow = () => this.page.locator('xpath=//div[@data-grid-row-index="0"]');
    flyoutLogMessage = () => this.page.getByTestId('logExplorerFlyoutLogMessage');
    flyoutService = () => this.page.getByTestId('logExplorerFlyoutService');
    docViewer = () => this.page.getByTestId('kbnDocViewer');
    datasetSelectorButton = () => this.page.getByTestId('datasetSelectorPopoverButton');
    datasetNginx = () => this.page.locator('xpath=//button//span[text()="Nginx"]');
    datasetNginxAccess = () => this.page.locator('xpath=//button//span[text()="access"]');

    public async clickLogsExplorerTab() {
        await this.logsExplorerTab().click();
        }

    public async assertVisibilityCanvas() {
        await expect(this.logsCanvas()).toBeVisible();
        }
    
    public async filterLogsByError() {
        await this.logsSearchField().click();
        await this.logsSearchField().fill('error');
        await this.fieldToggleError().click();
        }

    public async expandLogsDataGridRow() {
        await this.logsDataGridRow().click();
        }

    public async assertVisibilityDataGridRow() {
        await expect(this.logsDataGridRow()).toBeVisible();
        }

    public async assertVisibilityFlyoutLogMessage() {
        await expect(this.flyoutLogMessage()).toBeVisible();
        }

    public async assertVisibilityFlyoutService() {
        await expect(this.flyoutService()).toBeVisible();
        }

    public async assertVisibilityDocViewer() {
        await expect(this.docViewer()).toBeVisible();
        }

    public async filterByNginxAccess() {
        await this.datasetSelectorButton().click();
        await this.datasetNginx().click();
        await this.datasetNginxAccess().click();
        }
}