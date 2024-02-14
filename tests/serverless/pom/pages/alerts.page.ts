import { expect, Page } from "@playwright/test";

export default class AlertsPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

// Top level Alerts page locators
manageRulesButton = () => this.page.getByTestId('manageRulesPageButton');
createRuleButton = () => this.page.getByTestId('createRuleButton');

// Rule creation flyout locators
ruleNameInput = () => this.page.getByTestId('ruleNameInput');
saveRuleButton = () => this.page.getByTestId('saveRuleButton');
confirmButton = () => this.page.getByTestId('confirmModalConfirmButton');

// Error count threshold type locators
errorCountThresholdType = () => this.page.getByTestId('apm.error_rate-SelectOption');
isAboveErrorsOption = () => this.page.locator('xpath=//div[@data-test-subj="ruleGroupTypeSelectContainer"]/div[5]/div[4]');
isAboveErrorsInput = () => this.page.getByTestId('apmIsAboveFieldFieldNumber');
forTheLastOption = () => this.page.locator('xpath=//div[@data-test-subj="ruleGroupTypeSelectContainer"]/div[5]/div[5]');
timeNumberInput = () => this.page.getByTestId('timeWindowSizeNumber');
timeUnitSelect = () => this.page.getByTestId('timeWindowUnitSelect');


public async clickManageRules() {
    await this.manageRulesButton().click();
    }

// Error count threshold type methods
public async createRuleErrorCountThreshold(ruleName: string, errorsNumber: string, timeNumber: string, timeUnit: string) {
    await this.manageRulesButton().click();
    await this.createRuleButton().click();
    await this.ruleNameInput().fill(ruleName);
    await this.errorCountThresholdType().click();
    await this.isAboveErrorsOption().click();
    await this.isAboveErrorsInput().fill(errorsNumber);
    await this.forTheLastOption().click();
    await this.timeNumberInput().fill(timeNumber);
    await this.timeUnitSelect().click();
    await this.timeUnitSelect().selectOption({ value: timeUnit });
    await this.saveRuleButton().click();
    await this.confirmButton().click();
    await expect(this.page.locator(`xpath=//button[@title='${ruleName}']`)).toBeVisible();
    }

}