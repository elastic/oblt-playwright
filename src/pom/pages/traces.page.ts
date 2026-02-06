import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

export default class TracesPage extends BasePage {

    private readonly tracesExplorerTab = () => this.page.getByRole('tab', { name: 'Explorer' });
    private readonly explorerSearchField = () => this.page.getByPlaceholder('Filter your data using KQL syntax');
    private readonly explorerSearchButton = () => this.page.getByTestId('apmTraceSearchBoxSearchButton');
    private readonly relatedError = () => this.page.locator('xpath=(//a[@title="View related error"])[1]');
    private readonly relatedErrors = () => this.page.locator('xpath=(//a[@title="View 2 related errors"])[1]');

    public async openExplorerTab() {
        await this.tracesExplorerTab().click();
      }

    public async filterBy(code: string) {
        await this.explorerSearchField().click();
        await this.explorerSearchField().fill(code);
        await this.explorerSearchButton().click();
      }

    public async assertRelatedError() {
        await expect(this.relatedError() || this.relatedErrors(), 'Trace-related errors in timeline should be visible').toBeVisible();
      }

    public async clickRelatedError() {
        this.relatedError() ? await this.relatedError().click() : await this.relatedErrors().click();
      }
}