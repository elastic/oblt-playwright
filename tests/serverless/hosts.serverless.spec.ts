import { test } from '../fixtures/serverless/basePage';
import { expect } from "@playwright/test";
let apiKey = process.env.API_KEY;

test.beforeAll('Check node data', async ({request}) => {
  console.log(`... checking node data.`);
  const currentTime = Date.now();
  const rangeTime = currentTime - 1200000;

  let response = await request.post('api/metrics/snapshot', {
    headers: {
        "accept": "application/json",
        "Authorization": apiKey,
        "Content-Type": "application/json;charset=UTF-8",
        "kbn-xsrf": "true",          
        "x-elastic-internal-origin": "kibana"
    },
    data: {
        "filterQuery":"",
        "metrics":[{"type":"cpu"}],
        "nodeType":"host","sourceId":"default",
        "accountId":"",
        "region":"",
        "groupBy":[],
        "timerange":{"interval":"1m","to":currentTime,"from":rangeTime,"lookbackSize":5},
        "includeTimeseries":true,
        "dropPartialBuckets":true
      }
  })
  expect(response.status()).toBe(200);
  const jsonData = JSON.parse(await response.text());
  const nodesArr = jsonData.nodes;
  expect(nodesArr, 'The number of available nodes in the Inventory should not be less than 1.').not.toHaveLength(0);
  console.log(`✓ Node data is checked.`);
});

test.beforeEach(async ({ landingPage }) => {
  await landingPage.goto();
  await landingPage.clickInfrastructure();
});

test.afterEach(async ({}, testInfo) => {
    if (testInfo.status == testInfo.expectedStatus) {
        console.log(`✓ [${testInfo.title}] completed in ${testInfo.duration} ms.\n`);
}});

test('Hosts - Landing page.', async ({ datePicker, infrastructurePage, landingPage, page }, testInfo) => {
    const cpuUsage = "hostsView-metricChart-cpuUsage";
    const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";

    await test.step('step01', async () => {
        console.log(`\n[${testInfo.title}] Step 01 - Navigates to Hosts page.`);
        await landingPage.clickHosts();
    });
  
    await test.step('step02', async () => {
        console.log(`\n[${testInfo.title}] Step 02 - Filters data by selected time unit. Asserts visualizations loading time.`);
        await datePicker.clickDatePicker();
        await datePicker.fillTimeValue('30');
        await datePicker.selectTimeUnit('Days');
        await datePicker.clickApplyButton();
        await Promise.all([infrastructurePage.assertVisibilityVisualization(cpuUsage), infrastructurePage.assertVisibilityVisualization(normalizedLoad)]);
    });
  });