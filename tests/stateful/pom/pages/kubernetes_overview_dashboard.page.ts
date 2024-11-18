import { expect, Page } from "@playwright/test";

export default class KubernetesOverviewDashboardPage {
  page: Page;

  constructor(page: Page) {
      this.page = page;
  }

  private readonly nodesPanelHeader = () => this.page.locator('xpath=//figcaption[@data-test-subj="embeddablePanelHeading-Nodes"]');
  private readonly nodesInspectorButton = () => this.page.locator('xpath=//div[@data-test-subj="embeddablePanelHoverActions-Nodes"]//button[@data-test-subj="embeddablePanelAction-openInspector"]');
  private readonly inspectorPanel = () => this.page.locator('xpath=//div[@data-test-subj="inspectorPanel"]');
  private readonly nodesInspectorTableStatusTableCells = () => this.page.locator('xpath=//div[@data-test-subj="inspectorTable"]//td//div[contains(text(), "Status")]');


  public async openNodesInspector() {
    await this.nodesPanelHeader().hover();
    await this.nodesInspectorButton().click();
  }

  public async assetNodesInspectorStatusTableCells() {
    await expect(this.nodesInspectorTableStatusTableCells(), 'Status table cell should exist').toBeVisible();
  }

}
