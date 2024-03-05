import { expect, Page } from "@playwright/test";

export default class ServicesPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    dismissServiceGroupsTour = () => this.page.getByTestId('apmServiceGroupsTourDismissButton');
    opbeansGo = () => this.page.locator('xpath=//span[contains(text(),"opbeans-go")]');
    servicesTransactionsTab = () => this.page.getByTestId('transactionsTab');
    mostImpactfulTransaction = () => this.page.locator('xpath=//table[@class="euiTable css-0 euiTable--responsive"]//tbody[@class="css-0"]//tr[@class="euiTableRow"][1]//td[@class="euiTableRowCell euiTableRowCell--middle"][1]//a');
    failedTransactionCorrelationsTab = () => this.page.getByRole('tab', { name: 'Failed transaction correlations' });
    filterByCorrelationValueButton = () => this.page.locator('xpath=//table[@class="euiTable css-0 euiTable--responsive"]//tbody[@class="css-0"]//tr[@class="euiTableRow euiTableRow-hasActions euiTableRow-isClickable"][1]//td[@class="euiTableRowCell euiTableRowCell--hasActions euiTableRowCell--middle"]//span[1]//button');
    filterByFieldValueButton = () => this.page.getByRole('button', { name: 'Field value', exact: true });
    investigateButton = () => this.page.getByRole('button', { name: 'Investigate' });
    investigateHostLogsButton = () => this.page.getByRole('link', { name: 'Host logs' });
    errorDistributionChart = () => this.page.getByTestId('errorDistribution');

    public async selectServiceOpbeansGo() {
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