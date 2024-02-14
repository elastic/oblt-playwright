import {test} from './fixtures/serverless/basePage';

test.beforeEach(async ({landingPage}) => {
    await landingPage.goto();
    await landingPage.clickAlerts();
  });
  
test('Create alerting rules', async ({alertsPage}) => {
    const ruleName = "[Playwright Test] apm.error_rate";
    const errorsNumber = "6000";
    const timeNumber = "5";
    const timeUnit = "m"; // Other options: s, h, d.

    // Creates "Error count threshold" rule.
    await test.step('step01', async () => {
        await alertsPage.createRuleErrorCountThreshold(ruleName, errorsNumber, timeNumber, timeUnit);
    });
});