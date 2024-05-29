import { expect, Page } from "@playwright/test";

export default class HostsPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly hostsNumber = () => this.page.locator('xpath=//div[@data-test-subj="hostsViewKPI-hostsCount"]//p[@class="echMetricText__value"]');
    private readonly hostsTable = () => this.page.getByTestId('hostsView-table-loaded');
    private readonly hostsMetricsTab = () => this.page.getByTestId('infraAssetDetailsMetricsTab');
    private readonly hostsLimit500 = () => this.page.getByTestId('hostsViewLimitSelection500Button');
    private readonly hostsLogs = () => this.page.getByTestId('hostsView-tabs-logs');
    private readonly tableCellHosts = () => this.page.locator('xpath=//tbody//tr[1]//td//span[contains(@class, "euiTableCellContent__text")]');

    public async clickTableCellHosts() {
        await this.tableCellHosts().click();
        }
    
    public async setHostsLimit500() {
        await this.hostsLimit500().click();
        }

    public async openHostsMetricsTab() {
        await this.hostsMetricsTab().click();
        }

    public async openHostsLogs() {
        await this.hostsLogs().click();
        }

    public async assertHostsNumber() {
        const startTime = performance.now();
        await expect(this.hostsNumber(), 'Hosts number should not be 0').not.toHaveText('0');
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Hosts Count": elapsedTime};
        return result;
        }

    public async assertVisibilityHostsTable() {
        const startTime = performance.now();
        await expect(this.hostsTable(), 'Hosts table should be visible').toBeVisible();
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Host Names and Metrics": elapsedTime};
        return result;
        }

    public async assertVisibilityVisualization(title: string) {
        const startTime = performance.now();
        Promise.all([
            await expect(this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="${title}"]//div[contains(@class, "euiProgress")]`), 'Progress bar should not be visible').not.toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {[title]: elapsedTime};
        return result;
        }

    public async assertVisibilityVisualizationMetricsTab(title: string) {
        const startTime = performance.now();
        Promise.all([
            await expect(this.page.locator(`xpath=//div[@data-test-subj="infraAssetDetailsMetricsTabContent"]//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="infraAssetDetailsMetricsTabContent"]//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "euiProgress")]`), 'Progress bar should not be visible').not.toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {[title]: elapsedTime};
        return result;
        }
}