import { expect, Page } from "@playwright/test";

export default class DashboardPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

dashboardHeading = () => this.page.locator('xpath=//*[@id="dashboardListingHeading"]');
dashboardTable = () => this.page.locator('xpath=//tbody[@class="css-0"]');
tags = () => this.page.locator('xpath=//span[@data-text="Tags"]');
tagKubernetes = () => this.page.getByTestId('tag-searchbar-option-Kubernetes');
visualizationOptions = () => this.page.getByTestId('embeddablePanelToggleMenuIcon');
inspector = () => this.page.getByTestId('embeddablePanelAction-openInspector');
inspectorChooser = () => this.page.getByTestId('inspectorViewChooser');
inspectorRequests = () => this.page.getByTestId('inspectorViewChooserRequests');
inspectorRequestDetail = () => this.page.getByTestId('inspectorRequestDetailRequest');
inspectorRequestCopyClipboardButton = () => this.page.getByTestId('inspectorRequestCopyClipboardButton');
flyoutCloseButton = () => this.page.getByTestId('euiFlyoutCloseButton');

public async assertVisibilityHeading() {
    await expect(this.dashboardHeading()).toBeVisible();
    }

public async assertVisibilityTable() {
    await expect(this.dashboardTable()).toBeVisible();
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

public async logQuery() {
    let clipboardData = await this.page.evaluate("navigator.clipboard.readText()");
    console.log('Elasticsearch query: ', '\n', clipboardData, '\n');
    }

public async logRequestTime(name: string) {
    console.log(name, process.env.DATE_PICKER , "| Request time:", await this.page.locator('xpath=//span[contains(@class, "euiBadge__text")]').textContent());
    }

public async logQueryTime(name: string) {
    console.log(name, process.env.DATE_PICKER , "| Query time:", await this.page.locator('xpath=//tr[@class="euiTableRow"][5]/td[2]//span[contains(@class, "euiTableCellContent__text")]').textContent());
    }

public async assertVisibilityVisualization(title: string) {
    await expect(this.page.locator(`xpath=//div[@data-title="${title}"]//canvas[@class="echCanvasRenderer"]`), 'visualization should be visible').toBeVisible();
    }

public async kubernetesVisualizationOptions(title: string) {
    await this.page.locator(`xpath=//button[@aria-label="Panel options for ${title}"]`).click();
    }
}
