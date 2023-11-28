import { expect, test as ess_teardown } from "@playwright/test";

ess_teardown('Delete dashboards', async ({page}) => {
  // Navigates to Observability > Stack Management > Saved Objects.
  await page.goto('/');
  await page.getByTestId('homeLink').click();
  await page.getByTestId('homeManage').click();
  await expect(page.locator('xpath=//span[contains(text(),"Saved Objects")]')).toBeVisible();
  await page.locator('xpath=//span[contains(text(),"Saved Objects")]').click();

  // Deletes dashboards.
  await page.getByTestId('savedObjectSearchBar').fill('Playwright Test');
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
  await page.getByTestId('checkboxSelectAll').click();
  await page.getByTestId('savedObjectsManagementDelete').click();
  await page.getByTestId('confirmModalConfirmButton').click();
 await page.waitForLoadState('networkidle');
});