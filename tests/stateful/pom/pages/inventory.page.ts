import { expect, Page } from "@playwright/test";

export default class InventoryPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }
    
    private readonly dismiss = () => this.page.locator('xpath=//span[contains(text(),"Dismiss")]');
    private readonly metricDropdown = () => this.page.getByTestId('infraInventoryMetricDropdown');
    private readonly metricMemoryUsage = () => this.page.locator('xpath=//div[@data-test-subj="infraInventoryMetricsContextMenu"]//span[contains(text(), "Memory usage")]');
    private readonly sortWaffleByDropdown = () => this.page.getByTestId('waffleSortByDropdown');
    private readonly sortWaffleByValue = () => this.page.getByTestId('waffleSortByValue');
    private readonly nodesWaffleMap = () => this.page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]');
    private readonly nodesWaffleMapContainer = () => this.page.locator('xpath=//div[@data-test-subj="waffleMap"]/div[1]/div[1]/div[2]/*[@data-test-subj="nodeContainer"][1]');
    private readonly inventorySwitcher = () => this.page.getByTestId('openInventorySwitcher');
    private readonly inventorySwitcherPods = () => this.page.getByTestId('goToPods');
    private readonly tableView = () => this.page.locator('xpath=//button[@title="Table view"]');
    private readonly tableCell = () => this.page.locator('xpath=(//tbody//td)[1]//span[contains(@class, "euiTableCellContent__text")]');
    private readonly popoverK8sMetrics = () => this.page.locator('xpath=//*[contains(text(),"Kubernetes Pod metrics")]');
    private readonly logsSearchField = () => this.page.locator('xpath=//input[@placeholder="Search for log entries..."]');
    private readonly inspector = () => this.page.locator('xpath=//..//button[@data-test-subj="embeddablePanelAction-openInspector"]');
    private readonly inspectorChooser = () => this.page.getByTestId('inspectorViewChooser');
    private readonly inspectorRequests = () => this.page.getByTestId('inspectorViewChooserRequests');
    private readonly inspectorRequestDetail = () => this.page.getByTestId('inspectorRequestDetailRequest');
    private readonly inspectorRequestCopyClipboardButton = () => this.page.getByTestId('inspectorRequestCopyClipboardButton');
    private readonly flyoutInfraAssetDetailsCloseButton = () => this.page.locator('xpath=//div[@data-component-name="infraAssetDetailsFlyout"]//button[@data-test-subj="euiFlyoutCloseButton"]');
    private readonly flyoutCloseButton = () => this.page.getByTestId('euiFlyoutCloseButton');
    private readonly canvas = () => this.page.locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]');
    private readonly aggregationPicker = () => this.page.getByTestId('infraMetricsExplorerAggregationPickerSelect');
    private readonly graphPerInput = () => this.page.locator('xpath=//input[@aria-label="Graph per"]');
    private readonly infraSearchField = () => this.page.locator('xpath=//input[@data-test-subj="infraSearchField"]');
    private readonly pressEnter = () => this.page.keyboard.press('Enter');
    private readonly arrowDown = () => this.page.keyboard.press('ArrowDown');
    private readonly noDataToDisplay = () => this.page.locator('xpath=//*[text()="There is no data to display."]');

    public async clickDismiss() {
        await this.dismiss().click();
        }

    public async sortByMetricValue() {
        await this.sortWaffleByDropdown().click();
        await this.sortWaffleByValue().click();
        }

    public async memoryUsage() {
        await this.metricDropdown().click();
        await this.metricMemoryUsage().click();
        }

    public async switchInventoryToPodsView() {
        await this.inventorySwitcher().click();
        await this.inventorySwitcherPods().click();
        }

    public async assertWaffleMap() {
        await expect(this.nodesWaffleMap(), 'Waffle map').toBeVisible();
        }

    public async clickNodeWaffleContainer() {
        await this.nodesWaffleMap().hover();
        await this.nodesWaffleMapContainer().click({ force: true });
        }

    public async switchToTableView() {
        await this.tableView().click();
        }
        
    public async clickTableCell() {
        await this.tableCell().click();
        }

    public async clickPopoverK8sMetrics() {
        await this.popoverK8sMetrics().click();
        }

    public async searchErrors() {
        await this.logsSearchField().fill('error');
        }

    public async openRequestsView() {
        await this.inspector().click();
        await this.inspectorChooser().click();
        await this.inspectorRequests().click();
        }

    public async queryToClipboard() {
        await this.inspectorRequestDetail().click();
        await this.inspectorRequestCopyClipboardButton().click();
        }
        
    public async closeFlyout() {
        await this.flyoutCloseButton().click();
        }

    public async closeInfraAssetDetailsFlyout() {
        await this.flyoutInfraAssetDetailsCloseButton().click();
        }

    public async logQuery(title: string) {
        let clipboardData = await this.page.evaluate("navigator.clipboard.readText()");
        console.log(title, ': ', '\n', clipboardData, '\n');
        }

    public async hostsVisualizationOptions(title: string) {
        await this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//button[@data-test-subj="embeddablePanelToggleMenuIcon"]`).click();
        }

    public async assertVisibilityVisualization(title: string) {
        if (await this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]`).isHidden()){
        await this.arrowDown();
        }
        const startTime = performance.now();
        await expect(this.page.locator(`xpath=//div[@data-test-embeddable-id="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible();
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        const result = {[title]: elapsedTime};
        return result;
        }

    public async assertVisibilityPodVisualization(title: string) {
        await expect(this.page.locator(`xpath=//div[@data-test-subj="infraMetricsPage"]//div[@id="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible();
        }

    public async clickAggregationPicker() {
        await this.aggregationPicker().click();
        }

    public async aggregateBy95thPercentile() {
        await this.aggregationPicker().selectOption({ value: 'p95' });
        }

    public async assertVisibilityMetricsCanvas() {
        await expect(this.canvas()).toBeVisible();
        }

    public async graphPerKubernetesNamespace() {
        await this.graphPerInput().click();
        await this.graphPerInput().fill('kubernetes.namespace');
        await this.arrowDown();
        await this.pressEnter();
        }

    public async filterByKubesystemNamespace() {
        await this.infraSearchField().click();
        await this.infraSearchField().fill('kube-system');
        await this.pressEnter();
        }

    public async assertNoData() {
        await expect(this.noDataToDisplay(), 'There is no data to display').toBeVisible();
        }
}