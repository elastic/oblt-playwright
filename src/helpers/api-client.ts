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

/**
 * Custom fetch wrapper for Elasticsearch requests.
 * Bypasses TLS certificate verification for local development
 * (e.g. self-signed certificates on localhost).
 */
function isLocalHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'localhost';
  } catch {
    return false;
  }
}

export async function esFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (isLocalHost(url)) {
    const original = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
      return await fetch(url, options);
    } finally {
      if (original === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = original;
      }
    }
  }
  return fetch(url, options);
}

function kibanaDefaultHeaders(): Record<string, string> {
  return {
    accept: 'application/json',
    Authorization: `ApiKey ${API_KEY}`,
    'Content-Type': 'application/json;charset=UTF-8',
    'kbn-xsrf': 'true',
    'x-elastic-internal-origin': 'kibana',
  };
}

function esDefaultHeaders(): Record<string, string> {
  return {
    "accept": "*/*",
    "Authorization": `ApiKey ${API_KEY}`,
    "Content-Type": "application/json",
    "kbn-xsrf": "reporting"
  };
}

export async function getHostData(request: APIRequestContext) {
  const currentTime: number = Date.now();
  const startTime: number = currentTime - 86400000;

  const response = await request.post('api/metrics/snapshot', {
    headers: kibanaDefaultHeaders(),
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
  expect(response.status()).toBe(200);
  return await response.json();
}

export async function getPodData(request: APIRequestContext) {
  const currentTime: number = Date.now();
  const startTime: number = currentTime - 86400000;

  const response = await request.post('api/metrics/snapshot', {
    headers: kibanaDefaultHeaders(),
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
  return await response.json();
}

export async function checkApmData(request: APIRequestContext): Promise<boolean> {
  const response = await request.get('internal/apm/has_data', {
    headers: kibanaDefaultHeaders(),
    data: {}
  })
  expect(response.status()).toBe(200);
  const body = await response.json();
  return body.hasData;
}

export async function fetchClusterData() {
  const jsonDataCluster: object = await esFetch(ELASTICSEARCH_HOST, {
    method: 'GET',
    headers: esDefaultHeaders()
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
    const response = await esFetch(url, {
      method: 'POST',
      headers: esDefaultHeaders(),
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
  const response = await esFetch(url, {
    method: 'GET',
    headers: esDefaultHeaders()
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const jsonDataNode = JSON.parse(await response.text());
  return jsonDataNode;
}

export type DataView = {
  name: string;
  pattern: string;
  timestampField: string;
};

export async function listDataViews(request: APIRequestContext): Promise<any[]> {
  const response = await request.get('/api/data_views', { headers: kibanaDefaultHeaders() });
  expect(response.status()).toBe(200);
  const payload = await response.json();
  return payload.data_view;
}

export async function createDataView(
  request: APIRequestContext,
  spec: DataView,
): Promise<any> {
  const response = await request.post('/api/data_views/data_view', {
    headers: kibanaDefaultHeaders(),
    data: { data_view: spec, override: false },
  });

  if (response.status() !== 200) {
    throw new Error(`Failed to create data view "${spec.name}". Status: ${response.status()}`);
  }
  
  const payload = await response.json();
  return payload.data_view ?? payload;
}

export async function ensureDataViews(
  request: APIRequestContext,
  specs: DataView[],
  log?: { info: (msg: string) => void; warn: (msg: string) => void },
): Promise<{ existing: any[]; created: DataView[] }> {
  const created: DataView[] = [];
  let existing = await listDataViews(request);
  const existingNames = new Set(existing.map(v => v.name?.trim()));

  for (const spec of specs) {
    if (existingNames.has(spec.name.trim())) {
      log?.info?.(`Data view already exists: "${spec.name}"`);
      continue;
    }

    log?.warn?.(`Creating data view: "${spec.name}"`);
    try {
      await createDataView(request, spec);
      created.push(spec);
      existingNames.add(spec.name.trim());
    } catch (e) {
      existing = await listDataViews(request);
      if (existing.some(v => v.name?.trim() === spec.name.trim())) {
        log?.info?.(`Data view appeared after create attempt: "${spec.name}"`);
        continue;
      }
      throw e;
    }
  }

  return { existing: await listDataViews(request), created };
}
