import { expect, Page } from "@playwright/test";

export default class LogsExplorerPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly logsSearchField = () => this.page.getByPlaceholder('Search field names');
    private readonly toggleErrorMessage = () => this.page.getByTestId('field-error.log.message');
    private readonly toggleTopValue = () => this.page.locator('xpath=//div[@data-test-subj="dscFieldStats-topValues-bucket"][1]//button[1]');
    private readonly logsCanvas = () => this.page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]');
    private readonly logsDataGridRow = () => this.page.locator('xpath=//div[@data-grid-row-index="0"]');
    private readonly flyoutLogMessage = () => this.page.getByTestId('logExplorerFlyoutLogMessage');
    private readonly flyoutService = () => this.page.getByTestId('logExplorerFlyoutService');
    private readonly docViewer = () => this.page.getByTestId('kbnDocViewer');
    private readonly datasetSelectorButton = () => this.page.getByTestId('datasetSelectorPopoverButton');
    private readonly datasetNginx = () => this.page.locator('xpath=//button//span[text()="Nginx"]');
    private readonly datasetNginxAccess = () => this.page.locator('xpath=//button//span[text()="access"]');

    public async assertVisibilityCanvas() {
        await expect(this.logsCanvas()).toBeVisible();
        }
    
    public async filterLogsByError() {
        await this.logsSearchField().click();
        await this.logsSearchField().fill('error');
        await this.toggleErrorMessage().click();
        await this.toggleTopValue().click();
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