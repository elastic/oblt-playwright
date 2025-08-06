import { expect, Page } from "@playwright/test";

export default class DashboardPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly dashboardHeading = () => this.page.locator('xpath=//*[@id="dashboardListingHeading"]');
    private readonly dashboardTable = () => this.page.locator('xpath=//tbody[@class="css-0"]');
    private readonly searchBox = () => this.page.getByTestId('tableListSearchBox');
    private readonly tags = () => this.page.locator('xpath=//span[@data-text="Tags"]');
    private readonly tagKubernetes = () => this.page.getByTestId('tag-searchbar-option-Kubernetes');
    private readonly visualizationOptions = () => this.page.getByTestId('embeddablePanelToggleMenuIcon');
    private readonly inspector = () => this.page.getByTestId('embeddablePanelAction-openInspector');
    private readonly inspectorChooser = () => this.page.getByTestId('inspectorViewChooser');
    private readonly inspectorRequests = () => this.page.getByTestId('inspectorViewChooserRequests');
    private readonly inspectorRequestDetail = () => this.page.getByTestId('inspectorRequestDetailRequest');
    private readonly inspectorRequestCopyClipboardButton = () => this.page.getByTestId('inspectorRequestCopyClipboardButton');
    private readonly flyoutCloseButton = () => this.page.getByTestId('euiFlyoutCloseButton');

    public async assertVisibilityHeading() {
        await expect(this.dashboardHeading()).toBeVisible();
        }

    public async assertVisibilityTable() {
        await expect(this.dashboardTable()).toBeVisible();
        }

    public async searchDashboard(input: string) {
        await this.searchBox().click();
        await this.searchBox().fill(input);
        await this.page.keyboard.press('Enter');
        }

    public async clickTags() {
        await this.tags().click();
        }

    public async filterByKubernetesTag() {
        await this.tags().click();
        await this.tagKubernetes().click();
        }

    public async clickOptions() {
        await this.visualizationOptions().click();
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

    public async logQuery(title: string) {
        let clipboardData = await this.page.evaluate("navigator.clipboard.readText()");
        console.log(title, ': ', '\n', clipboardData, '\n');
        }

    public async logRequestTime(name: string) {
        console.log(name, "Last", process.env.TIME_VALUE, process.env.TIME_UNIT, "| Request time:", await this.page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
        }

    public async logQueryTime(name: string) {
        console.log(name, "Last", process.env.TIME_VALUE, process.env.TIME_UNIT, "| Query time:", await this.page.locator('xpath=//tr[5]//td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
        }

    public async assertVisibilityVisualization(title: string) {
        await expect(this.page.locator(`xpath=//div[@data-title="${title}"]//canvas[@class="echCanvasRenderer"]`), `visualization "${title}" should be rendered`).toBeVisible();
        }

    public async assertEmbeddedError(title: string) {
        expect(this.page.locator(`xpath=//div[@data-title="${title}"]//div[@data-test-subj="embeddable-lens-failure"]`), `Error while loading visualization "${title}"`).toBeDefined();
        }

    public async assertNoData(title: string) {
        await expect(this.page.locator(`xpath=//div[@data-title="${title}"]//*[text()="No results found"]`), 'No results found').toBeVisible();
        }

    public async assertAlreadyClosedError(title: string) {
        await expect(this.page.locator(`xpath=//div[@data-title="${title}"]//*[text()="already closed"]`), `Already closed, can't increment ref count`).toBeVisible();
        }

    public async assertNoDashboard() {
        await expect(this.page.locator('xpath=//*[text()="No dashboards matched your search."]'), '"No dashboard found" message').toBeVisible();
        }

    public async kubernetesVisualizationOptions(title: string) {
        await this.page.locator(`xpath=//button[@aria-label="Panel options for ${title}"]`).click();
        }

    public async logVisualizationRequest(name: string) {
        await this.clickOptions();
        await this.openRequestsView();
        await this.logRequestTime(name);
        await this.logQueryTime(name);
        await this.queryToClipboard();
        await this.logQuery(name);
        await this.closeFlyout();
        }
}
