import {test} from '../../tests/fixtures/stateful/basePage';

test.beforeEach(async ({ page }) => {
  await page.goto('/app/observability-logs-explorer/dataset-quality');
});

test('Logs Explorer - Datasets', async ({datasetsPage}) => { 
    await test.step('pageContentLoading', async () => {
        await datasetsPage.assertVisibilityQualityStatistics();
        await datasetsPage.assertVisibilityStatistics();
        await datasetsPage.assertVisibilityTable();
    });
});