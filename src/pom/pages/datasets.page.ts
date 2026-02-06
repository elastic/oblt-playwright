import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

export default class DatasetsPage extends BasePage {

    private readonly qualityPoor = () => this.page.locator('xpath=(//h3)[1]');
    private readonly qualityDegraded = () => this.page.locator('xpath=(//h3)[2]');
    private readonly qualityGood = () => this.page.locator('xpath=(//h3)[3]');
    private readonly activeDatasetsNumber = () => this.page.locator('xpath=(//h3)[4]');
    private readonly estimatedData = () => this.page.locator('xpath=(//h3)[5]');
    private readonly table = () => this.page.locator('xpath=//tbody');
    private readonly degradedDocsColumn = () => this.page.locator('xpath=//tbody//tr[1]//td[5]');

    public async assertVisibilityQualityStatistics() {
        await expect(this.qualityPoor()).toBeVisible();
        await expect(this.qualityDegraded()).toBeVisible();
        await expect(this.qualityGood()).toBeVisible();
    }

    public async assertVisibilityStatistics() {
        await expect(this.activeDatasetsNumber()).toBeVisible();
        await expect(this.estimatedData()).toBeVisible();
    }

    public async assertVisibilityTable() {
        await expect(this.table()).toBeVisible();
        await expect(this.degradedDocsColumn()).toBeVisible();
    }
}