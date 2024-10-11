import { expect, Page } from "@playwright/test";

export default class HostsPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly hostsNumber = () => this.page.locator('xpath=//div[@data-test-subj="hostsViewKPI-hostsCount"]//p[@class="echMetricText__value"]');
    private readonly hostsTable = () => this.page.getByTestId('hostsView-table-loaded');
    private readonly hostsTableNoData = () => this.page.getByTestId('hostsViewTableNoData');
    private readonly logsTab = () => this.page.getByTestId('hostsView-tabs-logs');
    private readonly logStream = () => this.page.getByTestId('logStream');
    public readonly logStreamNoMessages = () => this.page.locator('xpath=//h2[contains(text(),"There are no log messages to display.")]');
    private readonly alertsTab = () => this.page.getByTestId('hostsView-tabs-alerts');
    private readonly alertsChart = () => this.page.locator('xpath=//div[@data-test-subj="alertSummaryWidgetFullSizeChartContainer"]//div[contains(@class, "echChartContent")]');
    private readonly alertsTable = () => this.page.getByTestId('alertsTable');
    private readonly hostsMetadataTab = () => this.page.getByTestId('infraAssetDetailsMetadataTab');
    private readonly hostsMetadataTable = () => this.page.locator('xpath=//div[@data-test-subj="infraAssetDetailsMetadataTable"]//tbody[@class="css-0"]');
    public readonly hostsMetricsTab = () => this.page.getByTestId('infraAssetDetailsMetricsTab');
    private readonly hostsProcessesTab = () => this.page.getByTestId('infraAssetDetailsProcessesTab');
    public readonly hostsProcessesNotFound = () => this.page.locator('xpath=//strong[contains(text(),"No processes found")]');
    private readonly hostsProcessesTabTable = () => this.page.locator('xpath=//table[@data-test-subj="infraAssetDetailsProcessesTable"]');
    public readonly hostsProfilingTab = () => this.page.getByTestId('infraAssetDetailsProfilingTab');
    public readonly hostsAddProfilingButton = () => this.page.getByTestId('infraProfilingEmptyStateAddProfilingButton');
    private readonly profilingTabFlamegraph = () => this.page.locator('xpath=//div[@data-test-subj="infraAssetDetailsProfilingTabContent"]//div[contains(@class, "echChartContent")]');
    private readonly profilingTabFlamegraphProgressBar = () => this.page.locator('xpath=//div[@aria-labelledby="flamegraph"]//span[@role="progressbar"]');
    private readonly hostsLogsTab = () => this.page.getByTestId('infraAssetDetailsLogsTab');
    private readonly hostsLogsTabStream = () => this.page.locator('xpath=//div[@data-test-subj="infraAssetDetailsLogsTabContent"]//div[@data-test-subj="logStream"]');
    private readonly hostsLimit500 = () => this.page.getByTestId('hostsViewLimitSelection500Button');
    private readonly hostsLogs = () => this.page.getByTestId('hostsView-tabs-logs');
    private readonly tableCellHosts = () => this.page.locator('xpath=//tbody//tr[1]//td//span[contains(@class, "euiTableCellContent__text")]');
    private readonly errorFetchingResource = () => this.page.locator('xpath=//div[@data-test-subj="globalToastList"]//*[text()="Error while fetching resource"]');

    public async clickTableCellHosts() {
        await expect(this.hostsTable()).toBeVisible();
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

    public async openHostsProfilingTab() {
        await this.hostsProfilingTab().click();
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
            expect(this.hostsProcessesTabTable(), 'Processes table should be visible').toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Processes table": elapsedTime};
        return result;
        }

    public async assertVisibilityVisualization(title: string) {
        const startTime = performance.now();
        Promise.all([
            await expect(this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="${title}"][@data-loading="true"]`), 'Data loading should be completed').not.toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="${title}"]//div[contains(@class, "euiProgress")]`), 'Progress bar should not be visible').not.toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {[title]: elapsedTime};
        return result;
        }

    public async assertVisibilityVisualizationNoData(title: string) {
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

    public async assertVisibilityProfilingFlamegraph() {
        const startTime = performance.now();
        Promise.all([
            await expect(this.profilingTabFlamegraph(), 'Flamegraph visualization should be visible').toBeVisible(),
            await expect(this.profilingTabFlamegraphProgressBar(), 'Progress bar should not be visible').not.toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {'Universal Profiling Flamegraph': elapsedTime};
        return result;
        }

    public async assertVisibilityHostsLogsTabStream() {
        const startTime = performance.now();
        await Promise.all([
            expect(this.hostsLogsTabStream(), 'Log stream should be visible').toBeVisible(),
            //expect(this.logStreamNoMessages(), '"There are no log messages to display." message should be hidden').not.toBeVisible()
            ]);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {"Log stream": elapsedTime};
        return result;
        }

    public async assertErrorFetchingResource() {
        await expect(this.errorFetchingResource(), 'Error while fetching resource').toBeVisible();
        }
}