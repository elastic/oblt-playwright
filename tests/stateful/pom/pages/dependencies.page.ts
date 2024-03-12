import { expect, Page } from "@playwright/test";

export default class DependenciesPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly dependenciesOperationsTab = () => this.page.getByRole('tab', { name: 'Operations' });
    private readonly dependencyTableRow = () => this.page.locator('xpath=//table[@class="euiTable css-0 euiTable--responsive"]//tbody[@class="css-0"]//tr[@class="euiTableRow"][1]//td[1]//a');
    private readonly timelineTransaction = () => this.page.locator('xpath=(//div[@type="transaction"])[1]//*[@color]');
    private readonly tabPanel = () => this.page.locator('xpath=//*[@role="tabpanel"]');
    private readonly investigateButton = () => this.page.locator('xpath=//*[@role="dialog"]//*[@data-test-subj="apmActionMenuButtonInvestigateButton"]');
    private readonly investigateTraceLogsButton = () => this.page.getByRole('link', { name: 'Trace logs' });
    private readonly investigateDiscoverLink = () => this.page.locator('xpath=//*[contains(text(), "View transaction in Discover")]');

    public async clickTableRow() {
        await this.dependencyTableRow().click();
        }

    public async assertVisibilityTabPanel() {
        await expect(this.tabPanel()).toBeVisible();
        }

    public async openOperationsTab() {
        await this.dependenciesOperationsTab().click();
        }

    public async assertVisibilityTable() {
        await expect(this.dependencyTableRow()).toBeVisible();
        }

    public async clickTimelineTransaction() {
        await this.timelineTransaction().click();
        }

    public async assertVisibilityTimelineTransaction() {
        await expect(this.timelineTransaction()).toBeVisible();
        }

    public async clickInvestigateButton() {
        await this.investigateButton().click();
        }

    public async clickTraceLogsButton() {
        await this.investigateTraceLogsButton().click();
        }

    public async clickViewInDiscover() {
        await this.investigateDiscoverLink().click();
        }
}