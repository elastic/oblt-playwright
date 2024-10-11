import { expect, Page } from "@playwright/test";

export default class DatePicker {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly datePicker = () => this.page.getByTestId('superDatePickerToggleQuickMenuButton');
    private readonly datePickerStartDatePopoverButton = () => this.page.getByTestId('superDatePickerstartDatePopoverButton');
    private readonly datePickerEndDatePopoverButton = () => this.page.getByTestId('superDatePickerendDatePopoverButton');
    private readonly timeValue  = () => this.page.locator('xpath=//input[@aria-label="Time value"]');
    private readonly timeUnit = () => this.page.locator('xpath=//*[@aria-label="Time unit"]');
    private readonly applyButton = () => this.page.locator('xpath=//span[contains(text(), "Apply")]');
    private readonly showDatesButton = () => this.page.getByTestId('superDatePickerShowDatesButton');
    private readonly absoluteTabStartDate = () => this.page.locator('xpath=//button[@aria-label="Start date: Absolute"]');
    private readonly absoluteTabEndDate = () => this.page.locator('xpath=//button[@aria-label="End date: Absolute"]');
    private readonly dateInput = () => this.page.getByTestId('superDatePickerAbsoluteDateInput');
    private readonly nowButton = () => this.page.locator('xpath=//button[text()="now"]');
    private readonly refreshQuery = () => this.page.locator('xpath=//button//span[text()="Update"]');
    private readonly applyButtonPopover = () => this.page.getByTestId('superDatePickerApplyTimeButton');

    public async assertVisibilityDatePicker() {
        await expect(this.datePicker()).toBeVisible();
    }
    
    public async clickDatePicker() {
        await this.datePicker().click();
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

    /*
    Use this function to set a fixed time window. 
    */
    public async setPeriod(from: string = process.env.START_DATE, to: string = process.env.END_DATE) {
        await this.showDatesButton().click();
        await this.absoluteTabStartDate().click();
        await this.dateInput().fill(from);
        await this.page.keyboard.press('Enter');
        await this.nowButton().click();
        await this.absoluteTabEndDate().click();
        await this.dateInput().fill(to);
        await this.page.keyboard.press('Enter');
        await this.refreshQuery().click();
    }

    // public async setPeriod() {
    //     await this.clickDatePicker();
    //     await this.fillTimeValue(process.env.TIME_VALUE);
    //     await this.selectTimeUnit(process.env.TIME_UNIT);
    //     await this.clickApplyButton();
    // }
}