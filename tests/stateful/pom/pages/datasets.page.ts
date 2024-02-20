import { expect, Page } from "@playwright/test";

export default class DatasetsPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

// Locators
qualityPoor = () => this.page.locator('xpath=(//h3)[1]');
qualityDegraded = () => this.page.locator('xpath=(//h3)[2]');
qualityGood = () => this.page.locator('xpath=(//h3)[3]');
activeDatasetsNumber = () => this.page.locator('xpath=(//h3)[4]');
estimatedData = () => this.page.locator('xpath=(//h3)[5]');
table = () => this.page.locator('xpath=//tbody');
degradedDocsColumn = () => this.page.locator('xpath=//tbody//tr[1]//td[5]');

// Actions
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