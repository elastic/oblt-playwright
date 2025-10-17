import { expect, Page } from "@playwright/test";
import { 
    ABSOLUTE_TIME_RANGE, 
    START_DATE, 
    END_DATE, 
    TIME_VALUE, 
    TIME_UNIT 
    } from '../../env.ts';

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

    public async setInterval(
        from: string = START_DATE ?? "", // Example: 2025-06-11T00:00:00.000Z
        to: string = END_DATE ?? ""
        )
        {
        if (ABSOLUTE_TIME_RANGE === 'true') {
            await Promise.any([
                expect(this.showDatesButton()).toBeVisible(),
                expect(this.datePickerStartDatePopoverButton()).toBeVisible()
                ]);
            if (await this.showDatesButton().isVisible()) {
                await this.showDatesButton().click();
            } else {
                await this.datePickerStartDatePopoverButton().click();
            }
            await this.absoluteTabStartDate().click();
            await this.dateInput().fill(from);
            await this.page.keyboard.press('Enter');
            await this.page.waitForTimeout(500);
            await this.datePickerEndDatePopoverButton().click();
            await this.absoluteTabEndDate().click();
            await this.dateInput().fill(to);
            await this.page.keyboard.press('Enter');
            await expect(this.datePickerEndDatePopoverButton()).not.toHaveText('Now');
            await Promise.race([
                this.refreshQuery().click(),
                this.applyButtonPopover().click()
            ]);
        } else {
            await this.clickDatePicker();
            await this.fillTimeValue(TIME_VALUE);
            await this.selectTimeUnit(TIME_UNIT);
            await this.clickApplyButton();
        }
    }
}