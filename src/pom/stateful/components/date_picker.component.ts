import { expect, Page } from "@playwright/test";
import { TIME_VALUE, TIME_UNIT } from '../../../../src/env.ts';

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
    private readonly refreshButton = () => this.page.getByTestId('superDatePickerApplyTimeButton');
    private readonly selectedDate = () => this.page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER });
    private readonly showDatesButton = () => this.page.getByTestId('superDatePickerShowDatesButton');
    private readonly absoluteTabStartDate = () => this.page.locator('xpath=//button[@aria-label="Start date: Absolute"]');
    private readonly absoluteTabEndDate = () => this.page.locator('xpath=//button[@aria-label="End date: Absolute"]');
    private readonly dateInputStart = () => this.page.locator('form').filter({ hasText: 'Start date' }).getByTestId('superDatePickerAbsoluteDateInput');
    private readonly dateInputEnd = () => this.page.locator('form').filter({ hasText: 'End date' }).getByTestId('superDatePickerAbsoluteDateInput');
    private readonly nowButton = () => this.page.locator('xpath=//button[text()="now"]');
    private readonly refreshQuery = () => this.page.locator('xpath=//button//span[text()="Update"]');

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

    public async clickRefreshButton() {
        await this.refreshButton().click();
    }

    public async selectDate() {
        await this.selectedDate().click();
    }

    public async assertSelectedDate() {
        const truthiness = await this.selectedDate().isVisible();
        return truthiness;
    }

    /*
    Use this function to set a fixed time window. 
    */
    public async setPeriod(
        from: string = process.env.START_DATE ?? "", // Example: 2025-06-11T00:00:00.000Z
        to: string = process.env.END_DATE ?? ""
    ) {
        await this.showDatesButton().click();
        await this.absoluteTabStartDate().click();
        await this.dateInputStart().fill(from);
        await this.page.keyboard.press('Enter');
        await this.nowButton().click();
        await this.absoluteTabEndDate().click();
        await this.dateInputEnd().fill(to);
        await this.page.keyboard.press('Enter');
        await this.refreshQuery().click();
    }

    // public async setPeriod() {
    //     await this.clickDatePicker();
    //     await this.fillTimeValue(TIME_VALUE);
    //     await this.selectTimeUnit(TIME_UNIT);
    //     await this.clickApplyButton();
    // }

    public async setPeriodProfiling() {
        await this.clickDatePickerHostsProfiling();
        await this.fillTimeValue(TIME_VALUE);
        await this.selectTimeUnit(TIME_UNIT);
        await this.clickApplyButton();
    }
}