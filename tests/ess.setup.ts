import { expect, test as ess_setup } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";

ess_setup('Authentication', async ({page}) => {
    await page.goto(process.env.ELASTIC_URL);
    await page.getByRole('button', { name: 'Log in with Elasticsearch Typical for most users' }).click();
    await page.getByLabel('Username').fill(process.env.ELASTIC_USERNAME);
    await page.getByLabel('Password', { exact: true }).click();
    await page.getByLabel('Password', { exact: true }).fill(process.env.ELASTIC_PASSWORD, { timeout: 20000});
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveTitle('Home - Elastic', { timeout: 50000});
    await page.getByTestId('toggleNavButton').click();
    await expect(page.getByRole('link', {name: "Observability"})).toBeVisible();
    await page.getByRole('link', { name: 'Observability' }).click();
    await expect(page.getByTestId('globalLoadingIndicator-hidden')).toBeVisible();
    await page.context().storageState({path: STORAGE_STATE});
});