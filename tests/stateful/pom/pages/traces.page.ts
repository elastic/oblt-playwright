import { expect, Page } from "@playwright/test";

export default class TracesPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly tracesExplorerTab = () => this.page.getByRole('tab', { name: 'Explorer' });
    private readonly explorerSearchField = () => this.page.getByPlaceholder('Filter your data using KQL syntax');
    private readonly explorerSearchButton = () => this.page.getByTestId('apmTraceSearchBoxSearchButton');
    private readonly relatedError = () => this.page.locator('xpath=(//a[@title="View related error"])[1]');
    private readonly relatedErrors = () => this.page.locator('xpath=(//a[@title="View 2 related errors"])[1]');
    private readonly arrowDown = () => this.page.keyboard.press('ArrowDown');

    public async openExplorerTab() {
        await this.tracesExplorerTab().click();
        }

    public async filterBy(code: string) {
        await this.explorerSearchField().click();
        await this.explorerSearchField().fill(code);
        await this.explorerSearchButton().click();
        }

    public async clickRelatedError() {
        if (await this.relatedError().isHidden()){
            await this.arrowDown();
          } 
          
          await expect.soft(this.relatedError() || this.relatedErrors()).toBeVisible();
        
          if (await this.relatedError().isVisible()) {
            await this.relatedError().click();
          } else {
            await this.relatedErrors().click();
          }

        }
}