import { APIRequestContext, expect, Locator, TestInfo } from '@playwright/test';
import HeaderBar from '../tests/stateful/pom/components/header_bar.component';
import SideNav from '../tests/serverless/pom/components/side_nav.component';
import { SpaceSelector as SpaceSelectorStateful } from '../tests/stateful/pom/components/space_selector.component';
import { SpaceSelector as SpaceSelectorServerless } from '../tests/serverless/pom/components/space_selector.component';
const fs = require('fs');
const path = require('path');
const apiKey = process.env.API_KEY;
const outputDirectory = "/home/runner/work/oblt-playwright/";

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
  const currentTime = Date.now();
  const rangeTime = currentTime - 86400000;

  let b = await request.post('api/metrics/snapshot', {
    headers: {
      "accept": "application/json",
      "Authorization": apiKey,
      "Content-Type": "application/json;charset=UTF-8",
      "kbn-xsrf": "true",
      "x-elastic-internal-origin": "kibana"
    },
    data: {
      "filterQuery": "",
      "metrics": [{ "type": "memory" }],
      "nodeType": "host", "sourceId": "default",
      "accountId": "",
      "region": "",
      "groupBy": [],
      "timerange": { "interval": "1m", "to": currentTime, "from": rangeTime, "lookbackSize": 5 },
      "includeTimeseries": true,
      "dropPartialBuckets": true
    }
  });
  expect(b.status()).toBe(200);
  const jsonDataNode = JSON.parse(await b.text());
  return jsonDataNode;
}

export async function getPodData(request: APIRequestContext) {
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
      "filterQuery": "",
      "metrics": [{ "type": "cpu" }],
      "nodeType": "pod",
      "sourceId": "default",
      "accountId": "",
      "region": "",
      "groupBy": [],
      "timerange": { "interval": "1m", "to": currentTime, "from": rangeTime, "lookbackSize": 5 },
      "includeTimeseries": true,
      "dropPartialBuckets": true
    }
  })
  expect(response.status()).toBe(200);
  const jsonData = JSON.parse(await response.text());
  return jsonData;
}

export async function writeFileReportHosts(asyncResults: any, request: APIRequestContext, testInfo: TestInfo, testStartTime: number, ) {
  let versionNumber: string;
  let cluster_name: string;
  let cluster_uuid: string;

  let a = await request.get(`${process.env.ELASTICSEARCH_HOST}`, {
    headers: {
      "accept": "*/*",
      "Authorization": apiKey,
      "kbn-xsrf": "reporting",
      }
    }
  );
  expect(a.status()).toBe(200);
  const jsonDataCluster = JSON.parse(await a.text());
  versionNumber = jsonDataCluster.version.number;
  cluster_name = jsonDataCluster.cluster_name;
  cluster_uuid = jsonDataCluster.cluster_uuid;

  const resultsObj = asyncResults.reduce((acc, obj) => {
    return { ...acc, ...obj };
    }, {});
  const fileName = `${new Date(testStartTime).toISOString().replace(/:/g, '_')}.json`;
  const outputPath = path.join(outputDirectory, fileName);
  const reportData = {
    name: testInfo.title,
    cluster_name: cluster_name,
    cluster_uuid: cluster_uuid,
    version: versionNumber,
    date: testStartTime,
    time_window: `Last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`,
    measurements: resultsObj
    };
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
}
