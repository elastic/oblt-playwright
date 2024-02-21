import { expect, Page } from "@playwright/test";

export default class DiscoverPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    canvas = () => this.page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]');
    dataGridRow = () => this.page.locator('xpath=//div[@data-grid-row-index="0"]');
    dataGridRowToggle = () => this.page.locator('xpath=//div[@data-grid-row-index="0"]//button[@data-test-subj="docTableExpandToggleColumn"]');
    dataViewSwitcher = () => this.page.getByTestId('discover-dataView-switch-link');
    dataViewLogs = () => this.page.locator('xpath=//button//span[text()="access"]');
    dataViewMetrics = () => this.page.locator('xpath=//li[@value="logs-*"]');


    public async assertVisibilityCanvas() {
        await expect(this.canvas()).toBeVisible();
        }

    public async expandDataGridRow() {
        await this.dataGridRow().click();
        }

    public async assertVisibilityDataGridRow() {
        await expect(this.dataGridRow()).toBeVisible();
        }

    public async filterByLogs() {
        await this.dataViewSwitcher().click();
        await this.dataViewLogs().click();
        }

    public async filterByMetrics() {
        await this.dataViewSwitcher().click();
        await this.dataViewMetrics().click();
        }
}