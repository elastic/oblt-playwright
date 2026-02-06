import {
  APIRequestContext,
  expect
} from '@playwright/test';
import {
  ABSOLUTE_TIME_RANGE,
  API_KEY,
  ELASTICSEARCH_HOST,
  END_DATE,
  START_DATE,
  TIME_UNIT,
  TIME_VALUE,
} from '../env.ts';

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
