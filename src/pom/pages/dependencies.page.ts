import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

export default class DependenciesPage extends BasePage {

    private readonly dependenciesOperationsTab = () => this.page.getByRole('tab', { name: 'Operations' });
    private readonly dependencyTableRow = () => this.page.locator('xpath=//tbody[@class="css-0"]//tr[1]//a[1]');
    private readonly dependencyTableLoaded = () => this.page.locator('xpath=//div[@data-test-subj="dependenciesTable"]//div[@class="euiBasicTable"]');
    private readonly dependencyTableNotLoaded = () => this.page.locator('xpath=//span[@class="euiTableCellContent__text"][text()="Failed to fetch"]');
    private readonly operationsNotFound = () => this.page.locator('xpath=//*[text()="No operations found"]');
    private readonly unableToLoadPage = () => this.page.locator('xpath=//h2[@data-test-subj="errorBoundaryFatalHeader"]');
    private readonly timelineTransaction = () => this.page.locator('xpath=(//div[@type="transaction"])[1]//*[@color]');
    private readonly tabPanel = () => this.page.locator('xpath=//*[@role="tabpanel"]');
    private readonly investigateButton = () => this.page.getByRole('button', { name: 'Investigate' });
    private readonly investigateTraceLogs = () => this.page.locator('xpath=//div[@data-test-subj="apmActionMenuInvestigateButtonPopup"]//*[@title="Trace logs"]');

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

    public async assertOperationsNotFound() {
        await expect(this.operationsNotFound()).toBeVisible();
        }

    public async assertUnableToLoadPage() {
        await expect(this.unableToLoadPage()).toBeVisible();
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
        await this.investigateTraceLogs().click();
        }
}