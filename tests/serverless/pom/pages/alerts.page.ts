import { expect, Page } from "@playwright/test";

export default class AlertsPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Top level Alerts page locators
    private readonly manageRulesButton = () => this.page.getByTestId('manageRulesPageButton');
    private readonly createRuleButton = () => this.page.getByTestId('createRuleButton');

    // Rule creation flyout locators
    private readonly ruleNameInput = () => this.page.getByTestId('ruleNameInput');
    private readonly saveRuleButton = () => this.page.getByTestId('saveRuleButton');
    private readonly confirmButton = () => this.page.getByTestId('confirmModalConfirmButton');

    // Error count threshold type locators
    private readonly errorCountThresholdType = () => this.page.getByTestId('apm.error_rate-SelectOption');
    private readonly isAboveErrorsOption = () => this.page.locator('xpath=//div[@data-test-subj="ruleGroupTypeSelectContainer"]/div[5]/div[4]');
    private readonly isAboveErrorsInput = () => this.page.getByTestId('apmIsAboveFieldFieldNumber');
    private readonly forTheLastOption = () => this.page.locator('xpath=//div[@data-test-subj="ruleGroupTypeSelectContainer"]/div[5]/div[5]');
    private readonly timeNumberInput = () => this.page.getByTestId('timeWindowSizeNumber');
    private readonly timeUnitSelect = () => this.page.getByTestId('timeWindowUnitSelect');


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