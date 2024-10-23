import { test } from '@playwright/test';
import {
  loginStep,
  overviewPageStep,
  overviewPageRefreshStep,
  overviewPageRevisitStep,
  hostsPageStep,
  hostsUncommonProcessesTabStep,
  hostsAnomaliesTabStep,
  networksPageStep,
  reviewPageStep,
} from './scenario-helpers';

test('Scenario 1', async ({ page }) => {
    await loginStep(page, process.env.KIBANA_HOST, process.env.KIBANA_USERNAME, process.env.KIBANA_PASSWORD);
    await reviewPageStep(10000);
    await overviewPageStep(page);
    await reviewPageStep(20000);
    await overviewPageRefreshStep(page);
    await reviewPageStep(10000);
    await hostsPageStep(page);
    await reviewPageStep(30000);
    await hostsUncommonProcessesTabStep(page);
    await reviewPageStep(30000);
    await hostsAnomaliesTabStep(page);
    await reviewPageStep(10000);
    await networksPageStep(page);
    await reviewPageStep(30000);
    await overviewPageRevisitStep(page);
    await reviewPageStep(10000);
});