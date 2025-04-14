import { expect, Page } from "@playwright/test";

export default class DiscoverPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly canvas = () => this.page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]');
    private readonly dataGridRow = () => this.page.locator('xpath=//div[@data-grid-row-index="0"]');
    private readonly dataViewSwitcher = () => this.page.getByTestId('discover-dataView-switch-link');
    private readonly dataView = () => this.page.getByTestId('discover-dataView-switch-link');
    private readonly dataViewInput = () => this.page.locator('xpath=//*[@data-test-subj="changeDataViewPopover"]//input');
    private readonly dataViewLogs = () => this.page.locator('xpath=//li[@value="logs-*"]');
    private readonly dataViewMetrics = () => this.page.locator('xpath=//li[@value="metrics-*"]');
    private readonly logsSearchField = () => this.page.getByPlaceholder('Search field names');
    private readonly toggleErrorMessage = () => this.page.getByTestId('field-error.log.message');
    private readonly toggleTopValue = () => this.page.locator('xpath=//div[@data-test-subj="dscFieldStats-topValues-bucket"][1]//button[1]');
    private readonly histogramChartIsRendered = () => this.page.locator('xpath=//div[@data-test-subj="unifiedHistogramChart"]//div[@data-render-complete="true"]');
    private readonly logsDataGridRow = () => this.page.locator('xpath=//div[@data-grid-row-index="0"]');
    private readonly flyoutLogMessage = () => this.page.getByTestId('logExplorerFlyoutLogMessage');
    private readonly flyoutService = () => this.page.getByTestId('logExplorerFlyoutService');
    private readonly docViewer = () => this.page.getByTestId('kbnDocViewer');
    private readonly datasetSelectorButton = () => this.page.getByTestId('datasetSelectorPopoverButton');
    private readonly datasetKubernetes = () => this.page.locator('xpath=//button//span[text()="Kubernetes"]');
    private readonly datasetKubernetesContainer = () => this.page.locator('xpath=//button//span[text()="container_logs"]');
    private readonly fieldStatsTab = () => this.page.getByTestId('dscViewModeFieldStatsButton');
    private readonly fieldStatsDocCount = () => this.page.locator('xpath=//div[@data-test-subj="dataVisualizerTableContainer"]//tbody//tr[1]//td[@data-test-subj="dataVisualizerTableColumnDocumentsCount"]');
    private readonly patternsTab = () => this.page.getByTestId('dscViewModePatternAnalysisButton');
    public readonly logPatternsRowToggle = () => this.page.locator('xpath=//div[@data-test-subj="aiopsLogPatternsTable"]//tr[1]//td[@data-test-subj="aiopsLogPatternsExpandRowToggle"]');
    private readonly logPatternsFilterIn = () => this.page.locator('xpath=//div[@data-test-subj="aiopsLogPatternsTable"]//tr[1]//button[@data-test-subj="aiopsLogPatternsActionFilterInButton"]');
    public readonly patternsNotLoaded = () => this.page.locator('xpath=//div[@data-test-subj="globalToastList"]//span[contains(text(), "Error loading categories")]');

    public async clickFieldStatsTab() {
        await this.fieldStatsTab().click();
        }

    public async clickPatternsTab() {
        await this.patternsTab().click();
        }

    public async clickFilterPatternButton() {
        await this.logPatternsFilterIn().click();
        }

    public async selectLogsDataView() {
        await this.dataView().click();
        await this.dataViewInput().fill('logs-*');
        await this.dataViewLogs().click();
        }

    public async assertChartIsRendered() {
        await expect(this.histogramChartIsRendered()).toBeVisible();
        }

    public async assertVisibilityPatternsRowToggle() {
        await expect(this.logPatternsRowToggle()).toBeVisible();
        }

    public async assertVisibilityFieldStatsDocCount() {
        await expect(this.fieldStatsDocCount()).toBeVisible();
        }

    public async assertVisibilityCanvas() {
        await expect(this.canvas()).toBeVisible();
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

    public async filterByKubernetesContainer() {
        await this.datasetSelectorButton().click();
        await this.datasetKubernetes().click();
        await this.datasetKubernetesContainer().click();
        }

    public async expandDataGridRow() {
        await this.dataGridRow().click();
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