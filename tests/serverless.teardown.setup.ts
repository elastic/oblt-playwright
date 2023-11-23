import { expect, test as serverless_teardown } from '@playwright/test';

serverless_teardown('Delete dashboards', async ({page}) => {
  // Navigates to Project Settings > Management > Saved Objects.
  await page.goto('/');
  await page.locator('xpath=//button[@aria-controls="project_settings_project_nav"]').click();
  await page.locator('xpath=//span[contains(text(),"Management")]').click();
  await expect(page.locator('xpath=//a[contains(text(),"Saved Objects")]')).toBeVisible();
  await page.locator('xpath=//a[contains(text(),"Saved Objects")]').click();

  // Deletes dashboards.
  await page.getByTestId('savedObjectSearchBar').fill('Playwright Test');
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
  await page.getByTestId('checkboxSelectAll').click();
  await page.getByTestId('savedObjectsManagementDelete').click();
  await page.getByTestId('confirmModalConfirmButton').click();
  await page.waitForLoadState('networkidle');
});