import { test } from '../../src/fixtures/stateful/basePage';
import { spaceSelectorStateful } from "../../src/helpers.ts";

test.beforeEach(async ({ headerBar, page, sideNav, spaceSelector }) => {
  await sideNav.goto();
  await spaceSelectorStateful(headerBar, spaceSelector);
  await page.goto('/app/management/data/data_quality');
});

test('Data Set Quality', async ({ datasetsPage }) => { 
    await test.step('pageContentLoading', async () => {
        await datasetsPage.assertVisibilityQualityStatistics();
        await datasetsPage.assertVisibilityStatistics();
        await datasetsPage.assertVisibilityTable();
    });
});