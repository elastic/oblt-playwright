import { expect, Page } from "@playwright/test";

export default class DependenciesPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    dependenciesOperationsTab = () => this.page.getByRole('tab', { name: 'Operations' });
    dependencyTableRow = () => this.page.locator('xpath=//table[@class="euiTable css-0 euiTable--responsive"]//tbody[@class="css-0"]//tr[@class="euiTableRow"][1]//td[1]//a');
    timelineTransaction = () => this.page.locator('xpath=(//div[@type="transaction"])[1]//*[@color]');
    tabPanel = () => this.page.locator('xpath=//*[@role="tabpanel"]');
    investigateButton = () => this.page.locator('xpath=//*[@role="dialog"]//*[@data-test-subj="apmActionMenuButtonInvestigateButton"]');
    investigateTraceLogsButton = () => this.page.getByRole('link', { name: 'Trace logs' });

    public async clickTableRow() {
        await this.dependencyTableRow().click();
        }

    public async assertTabPanelVisibility() {
        await expect(this.tabPanel()).toBeVisible();
        }

    public async openOperationsTab() {
        await this.dependenciesOperationsTab().click();
        }

    public async assertTableVisibility() {
        await expect(this.dependencyTableRow()).toBeVisible();
        }

    public async clickTimelineTransaction() {
        await this.timelineTransaction().click();
        }

    public async assertTimelineTransactionVisibility() {
        await expect(this.timelineTransaction()).toBeVisible();
        }

    public async clickInvestigateButton() {
        await this.investigateButton().click();
        }

    public async clickTraceLogsButton() {
        await this.investigateTraceLogsButton().click();
        }
}