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
    private readonly logsNoDocs = () => this.page.locator('xpath=//div[@data-test-subj="docTable"]//div[@data-test-subj="savedSearchTotalDocuments"]/*[text()="0"]');
    private readonly logsDocTable = () => this.page.locator('xpath=//div[@data-test-subj="docTable"]');
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
        await expect(this.hostsNumber(), 'Hosts number should not be 0').not.toHaveText('0');
    }

    public async assertVisibilityHostsTable() {
        await Promise.all([
            expect(this.hostsTable(), 'Hosts table should be visible').toBeVisible(),
            expect(this.hostsTableNoData(), '"No data to display" message should be hidden').not.toBeVisible()
        ]);
    }

    public async assertDocTable() {
        await expect(this.logsDocTable(), 'Doc table should be visible').toBeVisible();
    }

    public async assertLogsDocNumber() {
        await expect(this.logsNoDocs(), 'The number of documents should not be 0').not.toBeVisible();
    }

    public async assertVisibilityNoLogs() {
        await expect(this.logStreamNoMessages(), '"There are no log messages to display." visibility').toBeVisible();
    }

    public async assertVisibilityAlertsChart() {
        await expect(this.alertsChart(), 'Alerts chart should be visible').toBeVisible();
    }

    public async assertVisibilityAlertsTable() {
        await expect(this.alertsTable(), 'Alerts table should be visible').toBeVisible();
    }

    public async assertNoResultsMatchMessage() {
        Promise.all([
            await expect(this.noResultsMatchMessage(), 'Alerts table should be visible').toBeVisible(),
            await expect(this.loadingIndicator(), 'Loading indicator should not be visible').not.toBeVisible()
        ]);
    }

    public async assertVisibilityHostsMetadataTable() {
        await expect(this.hostsMetadataTable(), 'Metadata table should be visible').toBeVisible();
    }

    public async assertVisibilityHostsProcessesTable() {
        await Promise.all([
            expect(this.hostsProcessesTabTable(), 'Processes table should be visible').toBeVisible(),
            expect(this.hostsProcessesNotFound(), '"There are no log messages to display." message should be hidden').not.toBeVisible()
        ]);
    }

    public async assertProcessesNotFound() {
        await expect(this.hostsProcessesNotFound(), 'Processes not found').toBeVisible();
    }

    public async assertVisibilityVisualization(title: string) {
        await Promise.all([
            await expect(this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="${title}"][@data-loading="true"]`), 'Data loading should be completed').not.toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="${title}"]//div[contains(@class, "euiProgress")]`), 'Progress bar should not be visible').not.toBeVisible()
        ]);
        await expect(this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]//p[@class="echMetricText__value"][@title="N/A"]`), `"${title}" visualization shows no data`).not.toBeVisible();
    }

    public async assertVisualizationNoData(title: string) {
        await expect(this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]//p[@class="echMetricText__value"][@title="N/A"]`), `"${title}" visualization shows no data`).toBeVisible()
    }

    public async assertVisibilityVisualizationMetricsTab(title: string) {
        Promise.all([
            await expect(this.page.locator(`xpath=//div[@data-test-subj="infraAssetDetailsMetricsTabContent"]//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible(),
            await expect(this.page.locator(`xpath=//div[@data-test-subj="infraAssetDetailsMetricsTabContent"]//div[@data-test-embeddable-id="${title}"][@data-loading="true"]`), 'Progress bar should not be visible').not.toBeVisible()
        ]);
    }

    public async assertVisibilityHostsLogsTabStream() {
        await Promise.all([
            expect(this.hostsLogsTabStream(), 'Log stream should be visible').toBeVisible()
        ]);
    }

    public async assertLogsNotFound() {
        await expect(this.logStreamNoMessages(), 'Logs not found').toBeVisible();
    }
}