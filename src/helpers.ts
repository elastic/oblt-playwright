import {
  APIRequestContext,
  Browser,
  Locator,
  Page,
  TestInfo,
  expect
} from '@playwright/test';
import {
  ABSOLUTE_TIME_RANGE,
  API_KEY,
  CI,
  ELASTICSEARCH_HOST,
  END_DATE,
  KIBANA_HOST,
  REPORT_CLUSTER_API_KEY,
  REPORT_CLUSTER_ES,
  START_DATE,
  TIME_UNIT,
  TIME_VALUE,
  REPORT_DIR,
} from '../src/env.ts';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger.ts';
import { Table } from 'console-table-printer';

const outputDirectory = CI === 'true' ? '/home/runner/work/oblt-playwright/' : REPORT_DIR;

type WaitForRes = [locatorIndex: number, locator: Locator];

export async function waitForOneOf(locators: Locator[]): Promise<WaitForRes> {
  const res = await Promise.race([
    ...locators.map(async (locator, index): Promise<WaitForRes> => {
      let timedOut = false;
      await locator.waitFor({ state: 'visible' }).catch(() => timedOut = true);
      return [timedOut ? -1 : index, locator];
    }),
  ]);
  if (res[0] === -1) {
    throw new Error('No locator is visible before timeout.');
  }
  return res;
}

export async function selectDefaultSpace(
  buildFlavor: string,
  page: Page
) {
  const [index] = await waitForOneOf([
    page.locator('xpath=//nav[@data-test-subj="projectLayoutSideNav"]'),
    page.locator('xpath=//div[@data-test-subj="helpMenuButton"]'),
    page.locator('xpath=//h1[contains(text(),"Select your space")]')
  ]);
  const selector = index === 2;
  if (selector) {
    await page.locator('xpath=//a[contains(text(),"Default")]').click();
    if (buildFlavor === 'default') {
      await expect(page.locator('xpath=//div[@data-test-subj="helpMenuButton"]'), 'Help menu button').toBeVisible();
    } else if (buildFlavor === 'serverless') {
      await expect(page.locator('xpath=//nav[@data-test-subj="projectLayoutSideNav"]'), 'Side navigation panel').toBeVisible();
    } else {
      throw new Error(`Unsupported build flavor: ${buildFlavor}`);
    }
  }
}

export async function getHostData(request: APIRequestContext) {
  const currentTime: number = Date.now();
  const startTime: number = currentTime - 86400000;

  let b = await request.post('api/metrics/snapshot', {
    headers: {
      "accept": "application/json",
      "Authorization": `ApiKey ${API_KEY}`,
      "Content-Type": "application/json;charset=UTF-8",
      "kbn-xsrf": "true",
      "x-elastic-internal-origin": "kibana"
    },
    data: {
      "filterQuery": "",
      "metrics": [{ "type": "memory" }],
      "nodeType": "host",
      "sourceId": "default",
      "accountId": "",
      "region": "",
      "groupBy": [],
      "timerange": { "interval": "1m", "to": currentTime, "from": startTime, "lookbackSize": 5 },
      "includeTimeseries": true,
      "dropPartialBuckets": true
    }
  });
  expect(b.status()).toBe(200);
  const jsonDataNode = JSON.parse(await b.text());
  return jsonDataNode;
}

export async function getPodData(request: APIRequestContext) {
  const currentTime: number = Date.now();
  const startTime: number = currentTime - 86400000;

  let response = await request.post('api/metrics/snapshot', {
    headers: {
      "accept": "application/json",
      "Authorization": `ApiKey ${API_KEY}`,
      "Content-Type": "application/json;charset=UTF-8",
      "kbn-xsrf": "true",
      "x-elastic-internal-origin": "kibana"
    },
    data: {
      "filterQuery": "",
      "metrics": [{ "type": "cpu" }],
      "nodeType": "pod",
      "sourceId": "default",
      "accountId": "",
      "region": "",
      "groupBy": [],
      "timerange": { "interval": "1m", "to": currentTime, "from": startTime, "lookbackSize": 5 },
      "includeTimeseries": true,
      "dropPartialBuckets": true
    }
  })
  expect(response.status()).toBe(200);
  const jsonData = JSON.parse(await response.text());
  return jsonData;
}

export async function checkApmData(request: APIRequestContext): Promise<boolean> {
  let response = await request.get('internal/apm/has_data', {
    headers: {
      "accept": "application/json",
      "Authorization": `ApiKey ${API_KEY}`,
      "Content-Type": "application/json;charset=UTF-8",
      "kbn-xsrf": "true",
      "x-elastic-internal-origin": "kibana"
    },
    data: {}
  })
  expect(response.status()).toBe(200);
  const body = JSON.parse(await response.text());
  return body.hasData;
}

export async function fetchClusterData() {
  const jsonDataCluster: object = await fetch(ELASTICSEARCH_HOST, {
    method: 'GET',
    headers: {
      "accept": "*/*",
      "Authorization": `ApiKey ${API_KEY}`,
      "kbn-xsrf": "reporting"
    }
  }).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.text();
  }).then(json => {
    return JSON.parse(json);
  });
  return jsonDataCluster;
}

export async function checkKibanaAvailability(page: Page) {
  try {
    const response = await page.goto(KIBANA_HOST, { 
      timeout: 30000,
      waitUntil: 'domcontentloaded' 
    });
    
    if (!response || !response.ok()) {
      throw new Error(`Kibana is not available. Status: ${response?.status()}`);
    }
    
    return {
      available: true,
      status: response.status(),
      url: KIBANA_HOST
    };
  } catch (error: any) {
    throw new Error(`Failed to reach Kibana at ${KIBANA_HOST}: ${error.message}`);
  }
}

export function getDatePickerLogMessage(): string {
  return ABSOLUTE_TIME_RANGE
    ? `Setting the fixed search interval from ${START_DATE} to ${END_DATE}`
    : `Setting the search interval of last ${TIME_VALUE} ${TIME_UNIT}`;
}

export async function importDashboards(browser: Browser, inputFile: string) {
  logger.info('Checking if Playwright dashboards are available');
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/app/management/kibana/objects');
  await page.locator('xpath=//input[@data-test-subj="savedObjectSearchBar"]').fill('Playwright type:(dashboard)');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  const noItems = await page.locator('xpath=//div[@data-test-subj="savedObjectsTable"]//span[contains(text(), "No items found")]').isVisible();
  if (noItems) {
    logger.info('Importing dashboards...');
    await page.getByRole('button', { name: 'Import' }).click();
    await page.locator('xpath=//input[@type="file"]').setInputFiles(inputFile);
    await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Import")]').click();
    await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Done")]').click();
  } else {
    logger.info('Dashboard(s) already exist.');
  }
  await context.close();
}

export async function getDocCount() {
  const indices: string[] = [
    `apm-*,logs-*.otel-*,logs-apm*,metrics-*.otel-*,metrics-apm*,traces-*.otel-*,traces-apm*`,
    `logs-*`,
    `metrics-*`
  ];

  const count: {
    apm: number;
    logs: number;
    metrics: number;
  } = {
    apm: 0,
    logs: 0,
    metrics: 0
  };

  let request_body: object;

  if (ABSOLUTE_TIME_RANGE) {
    request_body = {
      "query": {
        "range": {
          "@timestamp": {
            "gte": `${START_DATE}`,
            "lt": `${END_DATE}`,
            "format": "strict_date_optional_time||epoch_millis"
          }
        }
      }
    }
  } else {
    request_body = {
      "query": {
        "range": {
          "@timestamp": {
            "gte": `now-${TIME_VALUE}${TIME_UNIT.charAt(0).toLowerCase()}/${TIME_UNIT.charAt(0).toLowerCase()}`,
            "lt": "now"
          }
        }
      }
    }
  }

const fetchPromises = indices.map(async (item) => {
  const url = `${ELASTICSEARCH_HOST}/${item}/_count`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      "accept": "*/*",
      "Authorization": `ApiKey ${API_KEY}`,
      "Content-Type": "application/json",
      "kbn-xsrf": "reporting"
    },
    body: JSON.stringify(request_body)
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const jsonDataNode = JSON.parse(await response.text());

  switch (item) {
    case `apm-*,logs-*.otel-*,logs-apm*,metrics-*.otel-*,metrics-apm*,traces-*.otel-*,traces-apm*`:
      count.apm = jsonDataNode.count;
      break;
    case `logs-*`:
      count.logs = jsonDataNode.count;
      break;
    case `metrics-*`:
      count.metrics = jsonDataNode.count;
      break;
  }
});

await Promise.all(fetchPromises);
return count;
}

export async function writeJsonReport(
  clusterData: any,
  testInfo: TestInfo,
  testStartTime: string,
  docsCount?: object,
  stepData?: object[],
  cacheStats?: object,
  hostsMeasurements?: any
) {
  let build_flavor: any = clusterData.version.build_flavor;
  let cluster_name: any = clusterData.cluster_name;
  let hostsObject: {} = {};
  let files: string[] = [];

  const fileName = `${new Date(testStartTime).toISOString().replace(/:/g, '_')}_${testInfo.title.replace(/\s/g, "_").toLowerCase()}.json`;
  files.push(fileName);
  const outputPath = path.join(outputDirectory, fileName);

  if (hostsMeasurements) {
    hostsObject = hostsMeasurements.reduce((acc, obj) => {
      return { ...acc, ...obj };
    }, {});
  }

  const reportData = {
    title: testInfo.title,
    startTime: testStartTime,
    doc_count: docsCount,
    period: ABSOLUTE_TIME_RANGE
      ? `From ${START_DATE} to ${END_DATE}`
      : `Last ${TIME_VALUE} ${TIME_UNIT}`,
    status: testInfo.status,
    duration: testInfo.duration,
    ...(testInfo.errors.length > 0 && { errors: testInfo.errors }),
    cluster_name: cluster_name,
    build_flavor: build_flavor,
    steps: stepData ? stepData : null,
    ...(cacheStats && { cacheStats }),
    ...(hostsMeasurements && { measurements: hostsObject }),
  };
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
  return files;
}

export async function printResults(reportFiles: string[]) {
  try {
    reportFiles.forEach(file => {
      const filePath = path.join(outputDirectory, file);

      try {
        if (!fs.existsSync(filePath)) {
          console.error(`Test reports not found at '${filePath}'.`);
          return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        console.log(`\n\n`);

        const p = new Table({
          title: `[${jsonData.build_flavor}] ${jsonData.title} @ ${jsonData.period}`,
          columns: [
            { name: 'step', title: 'Step', color: "yellow" },
            { name: 'description', title: 'Description', maxLen: 50 },
            { name: 'start', title: 'Start' },
            { name: 'end', title: 'End' },
            { name: 'duration', title: 'Duration', color: "green" },
          ],
        });

        const data: any[] = [];

        if (Array.isArray(jsonData.steps) && jsonData.steps.length > 0) {
          jsonData.steps.forEach((stepObj: { [key: string]: any }) => {
            const stepName = Object.keys(stepObj)[0];
            const stepDetails = stepObj[stepName];

            if (stepDetails.status === 'passed') {
              const stepRow = {
                step: stepName,
                description: stepDetails.description || 'N/A',
                start: stepDetails.start ? new Date(stepDetails.start).toISOString() : 'N/A',
                end: stepDetails.end ? new Date(stepDetails.end).toISOString() : 'N/A',
                duration: stepDetails.duration ? `${Math.round(stepDetails.duration)} ms` : 'N/A',
              };
              data.push(stepRow);
            }
          });
        }
        
        if (data.length === 0) {
          data.push({ step: 'No passed steps found' });
        }

        p.addRows(data, { separator: true });
        p.printTable();

      } catch (innerError: any) {
        console.error(`Error processing file '${file}':`, innerError.message);
      }
    });
  } catch (error: any) {
    console.error('An error occurred while trying to read the report directory:', error.message);
  }
}

export async function testStep(
  title: string,
  stepData: object[],
  page: Page,
  stepFunction: any,
  description?: string,
  ...args: any[]
): Promise<any> {
  const start: string = new Date().toISOString();
  const startTimePerf: number = performance.now();
  try {
    const result: any = await stepFunction.apply(null, [page, ...args]);
    const endTimePerf: number = performance.now();
    const end: string = new Date().toISOString();
    const duration: number = Math.round(endTimePerf - startTimePerf);

    stepData.push({
      [title]: {
        start,
        end,
        duration,
        description,
        status: 'passed'
      }
    });

    return result;
  } catch (error) {
    const endTimePerf: number = performance.now();
    const end: string = new Date().toISOString();
    const duration: number = Math.round(endTimePerf - startTimePerf);
    
    stepData.push({
      [title]: {
        start,
        end,
        description,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      }
    });
    
    throw error;
  }
}

export async function getCacheStats() {
  const url = `${ELASTICSEARCH_HOST}/_searchable_snapshots/cache/stats?human`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "accept": "*/*",
      "Authorization": `ApiKey ${API_KEY}`,
      "kbn-xsrf": "reporting"
    }
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const jsonDataNode = JSON.parse(await response.text());
  return jsonDataNode;
}

export async function checkIndexExists(indexName: string): Promise<boolean> {
  const url = `${REPORT_CLUSTER_ES}/${indexName}`;
  const response = await fetch(url, {
    method: 'HEAD',
    headers: {
      'Authorization': `ApiKey ${REPORT_CLUSTER_API_KEY}`,
    },
  });
  return response.ok;
}

export async function checkIndexTemplateExists(templateName: string): Promise<boolean> {
  const url = `${REPORT_CLUSTER_ES}/_index_template/${templateName}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `ApiKey ${REPORT_CLUSTER_API_KEY}`,
    },
  });
  return response.ok;
}

export async function createIndexTemplate(templateName: string) {
  const url = `${REPORT_CLUSTER_ES}/_index_template/${templateName}`;
  const body = {
    index_patterns: [`${templateName}`],
    template: {
      mappings: {
        properties: {
          title: { type: 'text' },
          startTime: { type: 'date' },
          doc_count: {
            properties: {
              apm: { type: 'long' },
              logs: { type: 'long' },
              metrics: { type: 'long' },
            },
          },
          period: { type: 'keyword' },
          status: { type: 'keyword' },
          duration: { type: 'float' },
          errors: { type: 'object' },
          cluster_name: { type: 'keyword' },
          build_flavor: { type: 'keyword' },
          steps: { type: 'object' },
          cacheStats: { type: 'object' },
          measurements: { type: 'object' },
        },
      },
    },
  };
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `ApiKey ${REPORT_CLUSTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseBody = await response.json();
    throw new Error(`Failed to create index template. Response: ${JSON.stringify(responseBody)}`);
  }
  return response.ok;
}

export async function createIndex(indexName: string) {
  const url = `${REPORT_CLUSTER_ES}/${indexName}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `ApiKey ${REPORT_CLUSTER_API_KEY}`,
    },
  });
  if (!response.ok) {
    const responseBody = await response.json();
    throw new Error(`Failed to create index. Response: ${JSON.stringify(responseBody)}`);
  }
  return response.ok;
}
