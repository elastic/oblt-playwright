import { expect, Response } from "@playwright/test";
import { waitForOneOf } from "../../helpers/test-utils";
import { BasePage } from "../base.page";

/**
 * A search request carrying this query. Matching on the query text ties the
 * response to the submit that sent it, so results rendered for an earlier query
 * can't stand in for it. The query is compared in its JSON-escaped form.
 */
const isSearchForQuery = (query: string) => (response: Response) => {
    const request = response.request();
    return request.method() === 'POST'
        && new URL(response.url()).pathname.startsWith('/internal/search/')
        && (request.postData() ?? '').includes(JSON.stringify(query).slice(1, -1));
};

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
    private readonly classicQueryInput = () => this.page.getByTestId('queryInput');
    private readonly selectEsqlModeButton = () => this.page.getByTestId('select-text-based-language-btn');
    private readonly querySubmitButton = () => this.page.getByTestId('querySubmitButton');
    private readonly dataGridUpdating = () => this.page.getByTestId('discoverDataGridUpdating');
    private readonly totalHits = () => this.page.getByTestId('discoverQueryTotalHits');
    private readonly totalDocumentsProcessed = () => this.page.getByTestId('ESQLEditor-queryStats-totalDocumentsProcessed');
    private readonly dataGridRowCellValue = (value: string) =>
        this.page.getByTestId('dataGridRowCell').filter({ hasText: value });

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

    /** The value usually repeats across rows, so this asserts that at least one cell has it. */
    public async assertVisibilityDataGridRowCellValue(value: string) {
        await expect(this.dataGridRowCellValue(value), `"${value}" query result`).not.toHaveCount(0);
    }

    /**
     * Kibana's own page objects treat a search as finished when the grid has no
     * update indicator, the query bar shows Submit again (it shows Cancel while a
     * fetch runs) and the hit count is no longer loading.
     */
    public async assertSearchSettled() {
        await expect(this.dataGridUpdating(), 'Data grid update indicator').toBeHidden();
        await expect(this.querySubmitButton(), 'Query submit button').toBeVisible();
        await expect(this.totalHits(), 'Hit count').not.toHaveAttribute('data-fetch-status', 'loading');
    }

    public async assertVisibilityTotalDocumentsProcessed() {
        await expect(this.totalDocumentsProcessed(), 'Total documents processed').toBeVisible();
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
            this.esqlEditor().or(this.classicQueryInput()),
            'Query editor'
        ).toBeVisible();
        if (!(await this.esqlEditor().isVisible())) {
            this.log.info('Switching Discover to ES|QL mode');
            await this.selectEsqlModeButton().click();
        }
        await expect(this.esqlEditor(), 'ES|QL editor').toBeVisible();
        // The wrapper renders before Monaco mounts. Text typed in that window is lost
        // and the editor then initializes with the default query. Monaco renders no role
        // or test-subj for the mounted editor, so its own class is the signal here, as in
        // Kibana's page objects.
        await expect(this.esqlEditor().locator('.monaco-editor'), 'Monaco editor').toBeVisible();
    }

    /**
     * Resolves once the search request for this query has come back. If the typed
     * text was lost and another query ran, the request never matches and this fails.
     */
    public async runEsqlQuery(query: string) {
        this.log.info(`Running the ES|QL query: ${query}`);
        await this.esqlEditor().click();
        await this.page.keyboard.press('ControlOrMeta+A');
        await this.page.keyboard.insertText(query);
        await expect(this.querySubmitButton(), 'Query submit button').toBeEnabled();
        await Promise.all([
            this.page.waitForResponse(isSearchForQuery(query)),
            this.querySubmitButton().click(),
        ]);
    }
}