import { expect, Page } from "@playwright/test";

export default class DiscoverPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly canvas = () => this.page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]');
    private readonly dataGridRow = () => this.page.locator('xpath=//div[@data-grid-row-index="0"]');
    private readonly dataViewSwitcher = () => this.page.getByTestId('discover-dataView-switch-link');
    private readonly dataViewLogs = () => this.page.locator('xpath=//button//span[text()="access"]');
    private readonly dataViewMetrics = () => this.page.locator('xpath=//li[@value="logs-*"]');


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