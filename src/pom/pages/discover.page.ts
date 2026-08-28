import { expect } from "@playwright/test";
import { waitForOneOf } from "../../helpers/test-utils";
import { BasePage } from "../base.page";

export default class DiscoverPage extends BasePage {

    private readonly skipTour = () => this.page.locator('xpath=//div[@data-test-subj="nav-tour-step-sidenav-home"]//*[text()="Skip tour"]');
    private readonly dataViewSwitch = () => this.page.getByTestId('discover-dataView-switch-link');
    private readonly dataViewInput = () => this.page.locator('xpath=//*[@data-test-subj="changeDataViewPopover"]//input');
    private readonly dataViewList = (dataView: string) => this.page.locator('[role="option"]').filter({ hasText: dataView }).first();
    private readonly logsSearchField = () => this.page.getByPlaceholder('Search field names');
    private readonly fieldToggleError = () => this.page.getByTestId('fieldToggle-error.message');
    private readonly histogramChartIsRendered = () => this.page.locator('xpath=//div[@data-test-subj="unifiedHistogramChart"]//div[@data-render-complete="true"]');
    private readonly histogramEmbeddedError = () => this.page.locator('xpath=//div[@data-test-subj="unifiedHistogramChart"]//div[@data-test-subj="embeddable-lens-failure"]');
    private readonly chartCanvas = () => this.page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]');
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
    private readonly logPatternsRowToggle = () => this.page.locator('xpath=//div[@data-test-subj="aiopsLogPatternsTable"]//tr[1]//td[@data-test-subj="aiopsLogPatternsExpandRowToggle"]');
    private readonly logPatternsFilterIn = () => this.page.locator('xpath=//div[@data-test-subj="aiopsLogPatternsTable"]//tr[1]//button[@data-test-subj="aiopsLogPatternsActionFilterInButton"]');
    private readonly patternsNotLoaded = () => this.page.locator('xpath=//div[@data-test-subj="globalToastList"]//span[contains(text(), "Error loading categories")]');
    private readonly discoverNoResults = () => this.page.getByTestId('discoverNoResults');
    private readonly esqlEditor = () => this.page.getByTestId('ESQLEditor');
    private readonly switchToClassicButton = () => this.page.getByRole('button', { name: 'Switch to Classic' });
    private readonly queryInEsqlButton = () => this.page.getByRole('button', { name: 'Query in ES|QL' });
    private readonly querySubmitButton = () => this.page.getByTestId('querySubmitButton');
    private readonly dataGridRowCellValue = (value: string) =>
        this.page.locator(`xpath=(//*[@data-test-subj="dataGridRowCell"][contains(., "${value}")])[1]`);

    public async clickDataView() {
        await this.dataViewSwitch().click();
    }

    public async selectDataView(dataView: string) {
        this.log.info("Checking for welcome tour pop-up");
        const [index] = await waitForOneOf([
            this.skipTour(),
            this.dataViewSwitch()
        ]);
        const skipWelcomeTour = index === 0;
        if (skipWelcomeTour) {
            this.log.info("Skipping the welcome tour");
            await this.skipTour().click();
        }
        this.log.info(`Selecting "${dataView}" data view`);
        await this.dataViewSwitch().click();
        await this.dataViewInput().fill(dataView);
        await expect(this.dataViewList(dataView)).toBeVisible();
        await this.dataViewList(dataView).click();
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
        await expect(this.chartCanvas()).toBeVisible();
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

    public async assertVisibilityDataGridRowCellValue(value: string) {
        await expect(this.dataGridRowCellValue(value), `"${value}" query result`).toBeVisible();
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

    public async assertDiscoverNoResults() {
        await expect(this.discoverNoResults()).toBeVisible();
    }

    public async filterByKubernetesContainer() {
        await this.datasetSelectorButton().click();
        await this.datasetKubernetes().click();
        await this.datasetKubernetesContainer().click();
    }

    /**
     * Discover persists the query mode per user, so the starting mode is not
     * guaranteed. Waits for either mode toggle to render before branching,
     * otherwise the check runs against a Discover that has not mounted yet.
     */
    public async switchToEsqlMode() {
        await expect(
            this.switchToClassicButton().or(this.queryInEsqlButton()),
            'Query mode toggle'
        ).toBeVisible();
        if (await this.queryInEsqlButton().isVisible()) {
            this.log.info('Switching Discover to ES|QL mode');
            await this.queryInEsqlButton().click();
        }
        await expect(this.esqlEditor(), 'ES|QL editor').toBeVisible();
    }

    public async runEsqlQuery(query: string) {
        this.log.info(`Running the ES|QL query: ${query}`);
        await this.esqlEditor().click();
        await this.page.keyboard.press('ControlOrMeta+A');
        await this.page.keyboard.insertText(query);
        await expect(this.querySubmitButton(), 'Query submit button').toBeEnabled();
        await this.querySubmitButton().click();
    }
}