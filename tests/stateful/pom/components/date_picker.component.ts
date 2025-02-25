import { expect, Page } from "@playwright/test";
import { TIME_VALUE, TIME_UNIT } from '../../../../src/env';

export default class DatePicker {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly datePicker = () => this.page.getByTestId('superDatePickerToggleQuickMenuButton');
    private readonly datePickerHostsProfiling = () => this.page.locator('xpath=//div[@data-test-subj="infraAssetDetailsProfilingTabContent"]//button[@data-test-subj="superDatePickerToggleQuickMenuButton"]');
    private readonly timeValue  = () => this.page.locator('xpath=//input[@aria-label="Time value"]');
    private readonly timeUnit = () => this.page.locator('xpath=//*[@aria-label="Time unit"]');
    private readonly applyButton = () => this.page.locator('xpath=//span[contains(text(), "Apply")]');
    private readonly selectedDate = () => this.page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER });

    public async assertVisibilityDatePicker() {
        await expect(this.datePicker()).toBeVisible();
    }

    public async assertVisibilityDatePickerHostsProfiling() {
        await expect(this.datePickerHostsProfiling()).toBeVisible();
    }

    public async clickDatePicker() {
        await this.datePicker().click();
    }

    public async clickDatePickerHostsProfiling() {
        await this.datePickerHostsProfiling().click();
    }

    public async fillTimeValue(value: string) {
        await this.timeValue().fill(value);
    }

    public async selectTimeUnit(value: string) {
        await this.timeUnit().selectOption(value);
    }

    public async clickApplyButton() {
        await this.applyButton().click();
    }

    public async selectDate() {
        await this.selectedDate().click();
    }

    public async assertSelectedDate() {
        const truthiness = await this.selectedDate().isVisible();
        return truthiness;
    }

    public async setPeriod() {
        await this.clickDatePicker();
        await this.fillTimeValue(TIME_VALUE);
        await this.selectTimeUnit(TIME_UNIT);
        await this.clickApplyButton();
    }

    public async setPeriodProfiling() {
        await this.clickDatePickerHostsProfiling();
        await this.fillTimeValue(TIME_VALUE);
        await this.selectTimeUnit(TIME_UNIT);
        await this.clickApplyButton();
    }
}