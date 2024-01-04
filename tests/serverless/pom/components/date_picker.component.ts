import { expect, Page } from "@playwright/test";

export default class DatePicker {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

datePicker = () => this.page.getByTestId('superDatePickerToggleQuickMenuButton');
timeValue  = () => this.page.locator('xpath=//input[@aria-label="Time value"]');
timeUnit = () => this.page.locator('xpath=//*[@aria-label="Time unit"]');
applyButton = () => this.page.locator('xpath=//span[contains(text(), "Apply")]');
selectedDate = () => this.page.getByLabel('Commonly used').getByRole('button', { name: process.env.DATE_PICKER });

public async assertDatePickerVisibility() {
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
public async selectDate() {
    await this.selectedDate().click();
}
public async assertSelectedDate() {
    const truthiness = await this.selectedDate().isVisible();
    return truthiness;
}

}