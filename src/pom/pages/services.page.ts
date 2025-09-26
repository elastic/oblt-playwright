import { expect, Page } from "@playwright/test";

export default class ServicesPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly loadingIndicator = () => this.page.locator('xpath=//*[@data-test-subj="globalLoadingIndicator"]');
    private readonly searchBar = () => this.page.getByTestId('apmUnifiedSearchBar');
    private readonly querySubmitButton = () => this.page.getByTestId('querySubmitButton');
    private readonly opbeansGo = () => this.page.locator('xpath=//span[text()="opbeans-go"]');
    private readonly servicesTransactionsTab = () => this.page.getByTestId('transactionsTab');
    private readonly transactionErrorsNotFound = () => this.page.locator('xpath=//div[@data-test-subj="topErrorsForTransactionTable"]//*[text()="No errors found for this transaction group"]');
    private readonly mostImpactfulTransaction = () => this.page.locator('xpath=//div[@data-test-subj="transactionsGroupTable"]//tbody[@class="css-0"]//tr[1]//a[1]');
    private readonly failedTransactionCorrelationsTab = () => this.page.getByRole('tab', { name: 'Failed transaction correlations' });
    private readonly filterByCorrelationValueButton = () => this.page.locator('xpath=//div[@data-test-subj="apmCorrelationsTable"]//tbody[@class="css-0"]//tr[1]//td[4]//span[1]//button[1]');
    private readonly filterByFieldValueButton = () => this.page.getByRole('button', { name: 'Field value', exact: true });
    private readonly investigateButton = () => this.page.getByRole('button', { name: 'Investigate' });
    private readonly investigateTraceLogs = () => this.page.locator('xpath=//div[@data-test-subj="apmActionMenuInvestigateButtonPopup"]//*[@title="Trace logs"]');
    private readonly errorDistributionChart = () => this.page.getByTestId('errorDistribution');

    public async selectServiceOpbeansGo() {
        await this.searchBar().click();
        await this.searchBar().fill(`service.name: "opbeans-go"`);
        await this.querySubmitButton().click();
        await this.opbeansGo().click();
        }

    public async assertVisibilityTransactionsTab() {
        await expect(this.servicesTransactionsTab(), 'Transactions tab visualization should be visible').toBeVisible();
        }

    public async openTransactionsTab() {
        await this.servicesTransactionsTab().click();
        }

    public async assertTransactionErrorsNotFound() {
        await expect(this.transactionErrorsNotFound(), 'Transaction errors not found').toBeVisible();
        }

    public async selectMostImpactfulTransaction() {
        await this.mostImpactfulTransaction().click();
        }

    public async assertVisibilityVisualization(title: string) {
        Promise.all([
            await expect(this.page.locator(`xpath=//div[@data-test-subj="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible(),
            await expect(this.loadingIndicator(), 'Loading indicator should not be visible').not.toBeVisible()
            ]);
        }
        
    public async openFailedTransactionCorrelationsTab() {
        await this.failedTransactionCorrelationsTab().click();
        }

    public async filterByCorrelationValue() {
        await this.filterByCorrelationValueButton().click();
        }

    public async assertVisibilityCorrelationButton() {
        await expect(this.filterByCorrelationValueButton()).toBeVisible();
        }

    public async filterByFieldValue() {
        await this.filterByFieldValueButton().click();
        }

    public async clickInvestigate() {
        await this.investigateButton().click();
        }

    public async clickTraceLogsButton() {
        await this.investigateTraceLogs().click();
        }

    public async assertVisibilityErrorDistributionChart() {
        await expect(this.errorDistributionChart()).toBeVisible();
        }
}