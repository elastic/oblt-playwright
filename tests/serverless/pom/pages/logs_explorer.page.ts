import { expect, Page } from "@playwright/test";

export default class LogsExplorerPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly logsExplorerTab = () => this.page.getByTestId('logsExplorerTab');
    private readonly logsSearchField = () => this.page.getByPlaceholder('Search field names');
    private readonly fieldToggleError = () => this.page.getByTestId('fieldToggle-error.message');
    private readonly histogramChartIsRendered = () => this.page.locator('xpath=//div[@data-test-subj="unifiedHistogramChart"]//div[@data-render-complete="true"]');
    private readonly logsCanvas = () => this.page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]');
    private readonly logsDataGridRow = () => this.page.locator('xpath=//div[@data-test-subj="euiDataGridBody"]//div[1]//div[@data-test-subj="dataGridRowCell"][@aria-rowindex="1"][@data-gridcell-column-id="openDetails"][1]');
    private readonly flyoutLogMessage = () => this.page.getByTestId('logExplorerFlyoutLogMessage');
    private readonly flyoutService = () => this.page.getByTestId('logExplorerFlyoutService');
    private readonly docViewer = () => this.page.getByTestId('kbnDocViewer');
    private readonly datasetSelectorButton = () => this.page.getByTestId('dataSourceSelectorPopoverButton');
    private readonly datasetKubernetes = () => this.page.locator('xpath=//button//span[text()="Kubernetes"]');
    private readonly datasetKubernetesContainer = () => this.page.locator('xpath=//button//span[text()="container_logs"]');
    private readonly fieldStatsTab = () => this.page.getByTestId('dscViewModeFieldStatsButton');
    private readonly fieldStatsDocCount = () => this.page.locator('xpath=//div[@data-test-subj="dataVisualizerTableContainer"]//tbody//tr[1]//td[@data-test-subj="dataVisualizerTableColumnDocumentsCount"]');
    private readonly patternsTab = () => this.page.getByTestId('dscViewModePatternAnalysisButton');
    public readonly logPatternsRowToggle = () => this.page.locator('xpath=//div[@data-test-subj="aiopsLogPatternsTable"]//tr[1]//td[@data-test-subj="aiopsLogPatternsExpandRowToggle"]');
    private readonly logPatternsFilterIn = () => this.page.locator('xpath=//div[@data-test-subj="aiopsLogPatternsTable"]//tr[1]//button[@data-test-subj="aiopsLogPatternsActionFilterInButton"]');
    public readonly patternsNotLoaded = () => this.page.locator('xpath=//div[@data-test-subj="globalToastList"]//span[contains(text(), "Error loading categories")]');
    
    public async clickLogsExplorerTab() {
        await this.logsExplorerTab().click();
        }

    public async clickFieldStatsTab() {
        await this.fieldStatsTab().click();
        }

    public async clickPatternsTab() {
        await this.patternsTab().click();
        }

    public async clickFilterPatternButton() {
        await this.logPatternsFilterIn().click();
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

    public async filterByKubernetesContainer() {
        await this.datasetSelectorButton().click();
        await this.datasetKubernetes().click();
        await this.datasetKubernetesContainer().click();
        }
}