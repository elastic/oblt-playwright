import { expect, Page } from "@playwright/test";

export default class HostsPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly loadingIndicator = () => this.page.locator('xpath=//*[@data-test-subj="globalLoadingIndicator"]');
    private readonly hostsNumber = () => this.page.locator('xpath=//div[@data-test-subj="hostsViewKPI-hostsCount"]//p[@class="echMetricText__value"]');
    private readonly hostsTable = () => this.page.getByTestId('hostsView-table-loaded');
    private readonly hostsTableNoData = () => this.page.getByTestId('hostsViewTableNoData');
    private readonly logsTab = () => this.page.getByTestId('hostsView-tabs-logs');
    private readonly logStream = () => this.page.getByTestId('logStream');
    private readonly logStreamNoMessages = () => this.page.locator('xpath=//h2[contains(text(),"There are no log messages to display.")]');
    private readonly alertsTab = () => this.page.getByTestId('hostsView-tabs-alerts');
    private readonly alertsChart = () => this.page.locator('xpath=//div[@data-test-subj="alertSummaryWidgetFullSizeChartContainer"]//div[contains(@class, "echChartContent")]');
    private readonly alertsTable = () => this.page.getByTestId('alertsTable');
    private readonly noResultsMatchMessage = () => this.page.locator('xpath=//*[text()="No results match your search criteria"]');
    private readonly hostsMetadataTab = () => this.page.getByTestId('infraAssetDetailsMetadataTab');
    private readonly hostsMetadataTable = () => this.page.locator('xpath=//div[@data-test-subj="infraAssetDetailsMetadataTable"]//tbody[@class="css-0"]');
    private readonly hostsMetricsTab = () => this.page.getByTestId('infraAssetDetailsMetricsTab');
    private readonly hostsProcessesTab = () => this.page.getByTestId('infraAssetDetailsProcessesTab');
    private readonly hostsProcessesTabTable = () => this.page.locator('xpath=//table[@data-test-subj="infraAssetDetailsProcessesTable"]');
    private readonly hostsProcessesNotFound = () => this.page.locator('xpath=//strong[contains(text(),"No processes found")]');
    private readonly hostsLogsTab = () => this.page.getByTestId('infraAssetDetailsLogsTab');
    private readonly hostsLogsTabStream = () => this.page.locator('xpath=//div[@data-test-subj="infraAssetDetailsLogsTabContent"]//div[@data-test-subj="logStream"]');
    private readonly hostsLimit500 = () => this.page.getByTestId('hostsViewLimitSelection500Button');
    private readonly hostsLogs = () => this.page.getByTestId('hostsView-tabs-logs');
    private readonly tableCellHosts = () => this.page.locator('xpath=//tbody//tr[1]//td//span[contains(@class, "euiTableCellContent__text")]');
    private readonly errorFetchingResource = () => this.page.locator('xpath=//div[@data-test-subj="globalToastList"]//*[text()="Error while fetching resource"]');

    public async clickTableCellHosts() {
        await this.tableCellHosts().click();
        }
    
    public async setHostsLimit500() {
        await this.hostsLimit500().click();
        }

    public async clickLogsTab() {
        await this.logsTab().click();
        }

    public async clickAlertsTab() {
        await this.alertsTab().click();
        }

    public async openHostsMetadataTab() {
        await this.hostsMetadataTab().click();
        }

    public async openHostsMetricsTab() {
        await this.hostsMetricsTab().click();
        }

    public async openHostsProcessesTab() {
        await this.hostsProcessesTab().click();
        }

    public async openHostsLogsTab() {
        await this.hostsLogsTab().click();
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
        await Promise.all([
            expect(this.hostsTable(), 'Hosts table should be visible').toBeVisible(),
            expect(this.hostsTableNoData(), '"No data to display" message should be hidden').not.toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Host Names and Metrics": elapsedTime};
        return result;
        }

    public async assertVisibilityLogStream() {
        const startTime = performance.now();
        await expect(this.logStream(), 'Log stream should be visible').toBeVisible();
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Log stream": elapsedTime};
        return result;
        }

    public async assertVisibilityNoLogs() {
        await expect(this.logStreamNoMessages(), '"There are no log messages to display." visibility').toBeVisible();
        }

    public async assertVisibilityAlertsChart() {
        const startTime = performance.now();
        await expect(this.alertsChart(), 'Alerts chart should be visible').toBeVisible();
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Alerts chart": elapsedTime};
        return result;
        }

    public async assertVisibilityAlertsTable() {
        const startTime = performance.now();
        await expect(this.alertsTable(), 'Alerts table should be visible').toBeVisible();
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Alerts table": elapsedTime};
        return result;
        }

    public async assertNoResultsMatchMessage() {
        Promise.all([
            await expect(this.noResultsMatchMessage(), 'Alerts table should be visible').toBeVisible(),
            await expect(this.loadingIndicator(), 'Loading indicator should not be visible').not.toBeVisible()
            ]);
        }

    public async assertVisibilityHostsMetadataTable() {
        const startTime = performance.now();
        await expect(this.hostsMetadataTable(), 'Metadata table should be visible').toBeVisible();
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Metadata table": elapsedTime};
        return result;
        }

    public async assertVisibilityHostsProcessesTable() {
        const startTime = performance.now();
        await Promise.all([
            expect(this.hostsProcessesTabTable(), 'Processes table should be visible').toBeVisible(),
            expect(this.hostsProcessesNotFound(), '"There are no log messages to display." message should be hidden').not.toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Processes table": elapsedTime};
        return result;
        }

    public async assertProcessesNotFound() {
        await expect(this.hostsProcessesNotFound(), 'Processes not found').toBeVisible();
        }

    public async assertVisibilityVisualization(title: string) {
        const startTime = performance.now();
        await Promise.all([
            await expect(this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="${title}"][@data-loading="true"]`), 'Data loading should be completed').not.toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="${title}"]//div[contains(@class, "euiProgress")]`), 'Progress bar should not be visible').not.toBeVisible()
            ]);
        await expect(this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]//p[@class="echMetricText__value"][@title="N/A"]`), `"${title}" visualization shows no data`).not.toBeVisible();
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {[title]: elapsedTime};
        return result;
        }

    public async assertVisualizationNoData(title: string) {
        await expect(this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]//p[@class="echMetricText__value"][@title="N/A"]`), `"${title}" visualization shows no data`).toBeVisible()
        }

    public async assertVisibilityVisualizationMetricsTab(title: string) {
        const startTime = performance.now();
        Promise.all([
            await expect(this.page.locator(`xpath=//div[@data-test-subj="infraAssetDetailsMetricsTabContent"]//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="infraAssetDetailsMetricsTabContent"]//div[@data-test-embeddable-id="${title}"][@data-loading="true"]`), 'Progress bar should not be visible').not.toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {[title]: elapsedTime};
        return result;
        }

    public async assertVisibilityHostsLogsTabStream() {
        const startTime = performance.now();
        await Promise.all([
            expect(this.hostsLogsTabStream(), 'Log stream should be visible').toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Log stream": elapsedTime};
        return result;
        }

    public async assertLogsNotFound() {
        await expect(this.logStreamNoMessages(), 'Logs not found').toBeVisible();
        }

    public async assertErrorFetchingResource() {
        await expect(this.errorFetchingResource(), 'Error while fetching resource').toBeVisible();
        }
}