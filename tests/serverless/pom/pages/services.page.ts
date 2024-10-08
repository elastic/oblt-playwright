import { expect, Page } from "@playwright/test";

export default class ServicesPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly searchBar = () => this.page.getByTestId('apmUnifiedSearchBar');
    private readonly querySubmitButton = () => this.page.getByTestId('querySubmitButton');
    private readonly opbeansGo = () => this.page.locator('xpath=//span[contains(text(),"opbeans-go")]');
    private readonly servicesTransactionsTab = () => this.page.getByTestId('transactionsTab');
    private readonly mostImpactfulTransaction = () => this.page.locator('xpath=//div[@data-test-subj="transactionsGroupTable"]//tbody[@class="css-0"]//tr[1]//a[1]');
    private readonly failedTransactionCorrelationsTab = () => this.page.getByRole('tab', { name: 'Failed transaction correlations' });
    private readonly filterByCorrelationValueButton = () => this.page.locator('xpath=//div[@data-test-subj="apmCorrelationsTable"]//tbody[@class="css-0"]//tr[1]//td[4]//span[1]//button[1]');
    private readonly filterByFieldValueButton = () => this.page.getByRole('button', { name: 'Field value', exact: true });
    private readonly investigateButton = () => this.page.getByRole('button', { name: 'Investigate' });
    private readonly investigateHostLogsButton = () => this.page.getByRole('link', { name: 'Host logs' });
    private readonly errorDistributionChart = () => this.page.getByTestId('errorDistribution');
    public readonly errorFetchingResource = () => this.page.locator('xpath=//div[@data-test-subj="globalToastList"]//*[contains(text(), "Error while fetching resource")]');

    public async selectServiceOpbeansGo() {
        await this.searchBar().click();
        await this.searchBar().fill(`service.name: "opbeans-go"`);
        await this.querySubmitButton().click();
        await this.opbeansGo().click();
        }

    public async openTransactionsTab() {
        await this.servicesTransactionsTab().click();
        }

    public async selectMostImpactfulTransaction() {
        await this.mostImpactfulTransaction().click();
        }

    public async assertVisibilityVisualization(title: string) {
        await expect(this.page.locator(`xpath=//div[@data-test-subj="${title}"]//div[contains(@class, "echChartContent")]`), `"${title}" visualization should be visible`).toBeVisible();
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

    public async clickHostLogsButton() {
        await this.investigateHostLogsButton().click();
        }

    public async assertVisibilityErrorDistributionChart() {
        await expect(this.errorDistributionChart()).toBeVisible();
        }
}