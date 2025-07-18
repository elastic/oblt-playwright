import { APIRequestContext, expect, Locator, Page, TestInfo } from '@playwright/test';
import { ABSOLUTE_TIME_RANGE_ECH, ABSOLUTE_TIME_RANGE_SERVERLESS, API_KEY, CI, ELASTICSEARCH_HOST, TIME_VALUE, TIME_UNIT, START_DATE, END_DATE } from '../src/env.ts';
import SpaceSelectorStateful from './pom/stateful/components/space_selector.component';
import SpaceSelectorServerless from './pom/serverless/components/space_selector.component';
import HeaderBar from './pom/stateful/components/header_bar.component';
import SideNav from './pom/serverless/components/side_nav.component';
import * as fs from 'fs';
import * as path from 'path';

const outputDirectory = CI === 'true' ? '/home/runner/work/oblt-playwright/' : './playwright-report';

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

export async function spaceSelectorStateful(headerBar: HeaderBar, spaceSelector: SpaceSelectorStateful) {
  const [index] = await waitForOneOf([
    headerBar.helpMenuButton(),
    spaceSelector.spaceSelector()
  ]);
  const selector = index === 1;
  if (selector) {
    await spaceSelector.selectDefault();
    await headerBar.assertHelpMenuButton();
  };
}

export async function spaceSelectorServerless(sideNav: SideNav, spaceSelector: SpaceSelectorServerless) {
  const [index] = await waitForOneOf([
    sideNav.sideNav(),
    spaceSelector.spaceSelector(),
  ]);
  const selector = index === 1;
  if (selector) {
    await spaceSelector.selectDefault();
    await sideNav.assertSideNav();
  };
}

export async function getHostData(request: APIRequestContext) {
  const currentTime: number = Date.now();
  const startTime: number = currentTime - 86400000;

  let b = await request.post('api/metrics/snapshot', {
    headers: {
      "accept": "application/json",
      "Authorization": API_KEY,
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
      "Authorization": API_KEY,
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
      "Authorization": API_KEY,
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
      "Authorization": API_KEY,
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

export function getDatePickerLogMessageStateful(): string {
  return ABSOLUTE_TIME_RANGE_ECH === 'true'
    ? `Setting the fixed search interval from ${START_DATE} to ${END_DATE}`
    : `Setting the search interval of last ${TIME_VALUE} ${TIME_UNIT}`;
}

export function getDatePickerLogMessageServerless(): string {
  return ABSOLUTE_TIME_RANGE_SERVERLESS === 'true'
    ? `Setting the fixed search interval from ${START_DATE} to ${END_DATE}`
    : `Setting the search interval of last ${TIME_VALUE} ${TIME_UNIT}`;
}

export async function writeJsonReport(
  clusterData: any, 
  testInfo: TestInfo, 
  testStartTime: number,
  stepData?: object[],
  cacheStats?: object,
  hostsMeasurements?: any
  ) {
  let build_flavor: any = clusterData.version.build_flavor;
  let cluster_name: any = clusterData.cluster_name;
  let version: any = clusterData.version.number;
  let hostsObject: {} = {};

  const fileName = `${new Date(testStartTime).toISOString().replace(/:/g, '_')}_${testInfo.title.replace(/\s/g, "_").toLowerCase()}.json`;
  const outputPath = path.join(outputDirectory, fileName);

  if (hostsMeasurements) {
    hostsObject = hostsMeasurements.reduce((acc, obj) => {
      return { ...acc, ...obj };
    }, {});
  }

  const reportData = {
    title: testInfo.title,
    startTime: testStartTime,
    period: `Last ${TIME_VALUE} ${TIME_UNIT}`,
    status: testInfo.status,
    duration: testInfo.duration,
    errors: testInfo.errors,
    timeout: testInfo.timeout,
    cluster_name: cluster_name,
    version: version,
    build_flavor: build_flavor,
    steps: stepData ? stepData : null,
    cacheStats: cacheStats ? cacheStats : null,
    measurements: hostsMeasurements ? hostsObject : null,
  };
    
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
}

export async function testStep(
  title: string,
  stepData: object[],
  page: Page,
  stepFunction: any,
  ...args: any[]
): Promise<any> {
  const start = Date.now();
  const startTimePerf = performance.now();
  try {
    const result = await stepFunction.apply(null, [page, ...args]);
    const endTimePerf = performance.now();
    const end = Date.now();
    const duration = endTimePerf - startTimePerf;

    stepData.push({
        [title]: {
        start,
        end,
        duration
      }
    });

    return result;
  } catch (error) {
    throw error;
  }
}

export async function getCacheStats() {;
  const url = `${ELASTICSEARCH_HOST}/_searchable_snapshots/cache/stats?human`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "accept": "*/*",
      "Authorization": API_KEY,
      "kbn-xsrf": "reporting"
    }
  });
  if (!response.ok) {
      throw new Error(response.statusText);
    }
  const jsonDataNode = JSON.parse(await response.text());
  return jsonDataNode;
}