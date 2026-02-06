import { expect, Page } from "@playwright/test";
import logger from '../../logger.ts';
import { waitForOneOf } from "../../../src/helpers.ts";

export default class DiscoverPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public readonly discoverTab = () => this.page.getByTestId('discoverTab');
    private readonly skipTour = () => this.page.locator('xpath=//div[@data-test-subj="nav-tour-step-sidenav-home"]//*[text()="Skip tour"]');
    private readonly dataView = () => this.page.getByTestId('discover-dataView-switch-link');
    private readonly dataViewInput = () => this.page.locator('xpath=//*[@data-test-subj="changeDataViewPopover"]//input');
    private readonly dataViewLogs = () => this.page.locator('xpath=//li[@value="logs-*"]');
    private readonly logsSearchField = () => this.page.getByPlaceholder('Search field names');
    private readonly fieldToggleError = () => this.page.getByTestId('fieldToggle-error.message');
    private readonly histogramChartIsRendered = () => this.page.locator('xpath=//div[@data-test-subj="unifiedHistogramChart"]//div[@data-render-complete="true"]');
    private readonly histogramEmbeddedError = () => this.page.locator('xpath=//div[@data-test-subj="unifiedHistogramChart"]//div[@data-test-subj="embeddable-lens-failure"]');
    private readonly logsCanvas = () => this.page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]');
    private readonly logsDataGridRow = () => this.page.locator('xpath=//div[@data-test-subj="dataGridRowCell"][@aria-rowindex="1"][@data-gridcell-column-id="actions"][1]');
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
    private readonly patternsNotLoaded = () => this.page.locator('xpath=//div[@data-test-subj="globalToastList"]//span[contains(text(), "Error loading categories")]');

    public async clickDataView() {
        await this.dataView().click();
    }

    public async selectLogsDataView() {
        logger.info("Checking for welcome tour pop-up");
        const [index] = await waitForOneOf([
            this.skipTour(),
            this.dataView()
        ]);
        const skipWelcomeTour = index === 0;
        if (skipWelcomeTour) {
            logger.info("Skipping the welcome tour");
            await this.skipTour().click();
        }
        logger.info("Selecting logs data view");
        await this.dataView().click();
        await this.dataViewInput().fill('logs-*');
        await this.dataViewLogs().click();
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

    public async assertHistogramEmbeddedError() {
        await expect(this.histogramEmbeddedError()).toBeVisible();
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

    public async assertPatternsNotLoaded() {
        await expect(this.patternsNotLoaded()).toBeVisible();
    }

    public async filterByKubernetesContainer() {
        await this.datasetSelectorButton().click();
        await this.datasetKubernetes().click();
        await this.datasetKubernetesContainer().click();
    }
}