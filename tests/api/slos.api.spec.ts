import {test, expect} from '@playwright/test';
import { API_KEY, ELASTICSEARCH_HOST } from '../../src/env.ts';

async function teardown(request: any, sloName: string, sloId: string) {
  console.log(`Deleting SLO "${sloName}"...`);
  let deleteResponse: any = await request.delete(`api/observability/slos/${sloId}`, {
      data: {
      }
  });
  expect.soft(deleteResponse.status()).toBe(204);
  if (deleteResponse.status() == 204) {
    console.log(`SLO "${sloName}" has been deleted.`);
  };
};

test.beforeAll('Check APM data', async ({ request }) => {
  console.log(`... checking APM data.`);
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
  const body = await response.text();
  expect(body, 'Availability of APM data').toContain("true");
  if (response.status() == 200) {
    console.log(`✓ APM data is checked.`);
  }
});

test('sli.apm.transactionDuration', async({request}) => {
  test.setTimeout(600000);
  const sloName = "[Playwright Test] APM latency";
  const testStartTime = Date.now();
  let sloCreateResponse: any;
  let sloId: string;
  let latestSliTimestampISO!: string;
  let latestSliTimestampMillis: number;

  const apmTransactionDuration = await test.step('Create SLO [sli.apmTransactionDuration].', async () => {
    sloCreateResponse = await request.post('/api/observability/slos', {
        data: {
            "name": sloName,
            "description":"",
            "indicator":{
                "type":
                    "sli.apm.transactionDuration",
                    "params":{
                        "service":"opbeans-go",
                        "environment":"*",
                        "transactionType":"*",
                        "transactionName":"GET /api/customers",
                        "threshold":1000,
                        "filter":"",
                        "index":"metrics-apm*,apm-*"
                        }
            },
            "budgetingMethod":"occurrences",
            "timeWindow":{
                "duration":"30d",
                "type":"rolling"
            },
            "objective":{"target":0.99}
        }
    })  
    expect(sloCreateResponse.status()).toBe(200);
    if (sloCreateResponse.status() >= 200 && sloCreateResponse.status() < 300) {
        console.log("SLO", `"${sloName}"`, "has been created.")
    }
    return JSON.parse(await sloCreateResponse.text());
  });
  sloId = apmTransactionDuration.id;
  console.log('slo.id:', sloId);
  
  await test.step('Get the last timestamp of the source data.', async () => {
    console.log("Waiting for the next document in the source index...");
    try {
      await expect.poll(async () => {
        let sourceResponse = await request.post(`${ELASTICSEARCH_HOST}/metrics-*/_async_search`, {
              data: {
                  "sort": [
                    {
                      "@timestamp": {
                        "order": "desc",
                        "format": "strict_date_optional_time",
                        "unmapped_type": "boolean"
                      }
                    },
                    {
                      "_doc": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                      }
                    }
                  ],
                  "track_total_hits": false,
                  "fields": [
                    {
                      "field": "*",
                      "include_unmapped": "true"
                    },
                    {
                      "field": "@timestamp",
                      "format": "strict_date_optional_time"
                    }
                  ],
                  "size": 500,
                  "version": true,
                  "script_fields": {},
                  "stored_fields": [
                    "*"
                  ],
                  "runtime_mappings": {},
                  "_source": false,
                  "query": {
                    "bool": {
                      "must": [],
                      "filter": [
                        {
                          "range": {
                            "@timestamp": {
                              "gte": "now-15m",
                              "lte": "now"
                            }
                          }
                        },
                        {
                          "match_phrase": {
                            "service.name": "opbeans-go"
                          }
                        },
                        {
                          "match_phrase": {
                            "transaction.name": "GET /api/customers"
                          }
                        },
                        {
                          "match_phrase": {
                            "data_stream.type": "metrics"
                          }
                        },
                        {
                          "exists": {
                            "field": "transaction.duration.summary"
                          }
                        }
                      ],
                      "should": [],
                      "must_not": []
                    }
                  }
                }
          });
          const responseBody = await sourceResponse.json();
          let hitsArray = responseBody.response.hits.hits;
          if (Array.isArray(hitsArray) && hitsArray.length > 0) {
            latestSliTimestampISO = responseBody.response.hits.hits[0].fields["@timestamp"];
            latestSliTimestampMillis = Date.parse(latestSliTimestampISO);
            return latestSliTimestampMillis;
          }
        }, {
          message: 'Waiting for the next document in the source index.',
          intervals: [1_000],
          timeout: 600000,
        }).toBeGreaterThan(testStartTime);
      } catch (error) {
        console.warn('Test failed. Continuing with the teardown...');
        await teardown(request, sloName, sloId);
      }
  });
  console.log('The last @timestamp of the source data:', latestSliTimestampISO);

  const sli = async () => {
    await test.step('From source to rollup data.', async () => {
      console.log('Waiting for the next document in ".slo-observability.sli-v3*" indices...');
      try {
        await expect.poll(async () => {
          let sliResponseBody = await request.post(`${ELASTICSEARCH_HOST}/.slo-observability.sli-v3*/_async_search`, {
                data: {
                  "sort": [
                    {
                      "@timestamp": {
                        "order": "desc",
                        "format": "strict_date_optional_time",
                        "unmapped_type": "boolean"
                      }
                    },
                    {
                      "_doc": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                      }
                    }
                  ],
                  "track_total_hits": false,
                  "fields": [
                    {
                      "field": "*",
                      "include_unmapped": "true"
                    },
                    {
                      "field": "@timestamp",
                      "format": "strict_date_optional_time"
                    },
                    {
                      "field": "event.ingested",
                      "format": "strict_date_optional_time"
                    }
                  ],
                  "size": 500,
                  "version": true,
                  "script_fields": {},
                  "stored_fields": [
                    "*"
                  ],
                  "runtime_mappings": {},
                  "_source": false,
                  "query": {
                    "bool": {
                      "must": [],
                      "filter": [
                        {
                          "range": {
                            "@timestamp": {
                              "format": "strict_date_optional_time",
                              "gte": "now-15m",
                              "lte": "now"
                            }
                          }
                        },
                        {
                          "match_phrase": {
                            "slo.id": sloId
                          }
                        }
                      ],
                      "should": [],
                      "must_not": []
                    }
                  }
                }
            });
            const responseBody = JSON.parse(await sliResponseBody.text());
            let hitsArray = responseBody.response.hits.hits;
            if (Array.isArray(hitsArray) && hitsArray.length > 0) {
              return Date.parse(responseBody.response.hits.hits[0].fields["@timestamp"]);
            }
          }, {
            message: 'Waiting for the next document in the ".slo-observability.sli-v3*" index.',
            intervals: [1_000],
            timeout: 600000,
          }).toEqual(latestSliTimestampMillis);
        } catch (error) {
          console.warn('Test failed. Continuing with the teardown...');
          await teardown(request, sloName, sloId);;
        }
      });
  }

  const sloSummary = async () => {  
    await test.step('From source to summary.', async () => {
      console.log('Waiting for the update of the ".slo-observability.summary-v3.2" index...');
      await expect.poll(async () => {
        let sloSummaryResponseBody = await request.post(`${ELASTICSEARCH_HOST}/.slo-observability.summary-v3.2/_async_search`, {
              data: {
                "sort": [
                  {
                    "latestSliTimestamp": {
                      "order": "desc",
                      "format": "strict_date_optional_time",
                      "unmapped_type": "boolean"
                    }
                  },
                  {
                    "_doc": {
                      "order": "desc",
                      "unmapped_type": "boolean"
                    }
                  }
                ],
                "track_total_hits": false,
                "fields": [
                  {
                    "field": "*",
                    "include_unmapped": "true"
                  },
                  {
                    "field": "latestSliTimestamp",
                    "format": "strict_date_optional_time"
                  },
                  {
                    "field": "slo.createdAt",
                    "format": "strict_date_optional_time"
                  },
                  {
                    "field": "slo.updatedAt",
                    "format": "strict_date_optional_time"
                  },
                  {
                    "field": "summaryUpdatedAt",
                    "format": "strict_date_optional_time"
                  }
                ],
                "size": 500,
                "version": true,
                "script_fields": {},
                "stored_fields": [
                  "*"
                ],
                "runtime_mappings": {},
                "_source": false,
                "query": {
                  "bool": {
                    "must": [],
                    "filter": [
                      {
                        "range": {
                          "latestSliTimestamp": {
                            "format": "strict_date_optional_time",
                            "gte": "now-15m",
                            "lte": "now"
                          }
                        }
                      },
                      {
                        "match_phrase": {
                          "slo.id": sloId
                        }
                      }
                    ],
                    "should": [],
                    "must_not": []
                  }
                }
              }
          });
          const responseBody = JSON.parse(await sloSummaryResponseBody.text());
          let hitsArray = responseBody.response.hits.hits;
          if (Array.isArray(hitsArray) && hitsArray.length > 0) {
            return Date.parse(responseBody.response.hits.hits[0].fields["latestSliTimestamp"]);
          }
        }, {
          message: 'Waiting for the update of the ".slo-observability.summary-v3.2" index.',
          intervals: [1_000],
          timeout: 600000,
        }).toEqual(latestSliTimestampMillis)
      });
    };
  await Promise.all([sli(), sloSummary()]);
  await teardown(request, sloName, sloId);
});

test('sli.apm.transactionErrorRate', async({request}) => {
  test.setTimeout(600000);
  const sloName = "[Playwright Test] APM availability";
  const testStartTime = Date.now();
  let sloCreateResponse: any;
  let sloId: string;
  let latestSliTimestampISO!: string;
  let latestSliTimestampMillis: number;

  const apmTransactionErrorRate = await test.step('Create SLO [sli.apm.transactionErrorRate].', async () => {
    sloCreateResponse = await request.post('/api/observability/slos', {
        data: {
            "name": sloName,
            "description":"",
            "indicator":{
                "type":
                    "sli.apm.transactionErrorRate",
                    "params":{
                        "service":"opbeans-go",
                        "environment":"*",
                        "transactionType":"*",
                        "transactionName":"GET /api/customers",
                        "filter":"",
                        "index":"metrics-apm*,apm-*"
                        }
            },
            "budgetingMethod":"occurrences",
            "timeWindow":{
                "duration":"30d",
                "type":"rolling"
            },
            "objective":{"target":0.99}
        }
    })  
    expect(sloCreateResponse.status()).toBe(200);
    if (sloCreateResponse.status() >= 200 && sloCreateResponse.status() < 300) {
        console.log("SLO", `"${sloName}"`, "has been created.")
    }
    return JSON.parse(await sloCreateResponse.text());
  });
  sloId = apmTransactionErrorRate.id;
  console.log('slo.id:', sloId);

  await test.step('Get the last timestamp of the source data.', async () => {
    console.log("Waiting for the next document in the source index...");
    try {
      await expect.poll(async () => {
        let sourceResponse = await request.post(`${ELASTICSEARCH_HOST}/metrics-*/_async_search`, {
              data: {
                  "sort": [
                    {
                      "@timestamp": {
                        "order": "desc",
                        "format": "strict_date_optional_time",
                        "unmapped_type": "boolean"
                      }
                    },
                    {
                      "_doc": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                      }
                    }
                  ],
                  "track_total_hits": false,
                  "fields": [
                    {
                      "field": "*",
                      "include_unmapped": "true"
                    },
                    {
                      "field": "@timestamp",
                      "format": "strict_date_optional_time"
                    }
                  ],
                  "size": 500,
                  "version": true,
                  "script_fields": {},
                  "stored_fields": [
                    "*"
                  ],
                  "runtime_mappings": {},
                  "_source": false,
                  "query": {
                    "bool": {
                      "must": [],
                      "filter": [
                        {
                          "range": {
                            "@timestamp": {
                              "gte": "now-15m",
                              "lte": "now"
                            }
                          }
                        },
                        {
                          "match_phrase": {
                            "service.name": "opbeans-go"
                          }
                        },
                        {
                          "match_phrase": {
                            "transaction.name": "GET /api/customers"
                          }
                        },
                        {
                          "match_phrase": {
                            "data_stream.type": "metrics"
                          }
                        },
                        {
                          "exists": {
                            "field": "event.outcome"
                          }
                        }
                      ],
                      "should": [],
                      "must_not": []
                    }
                  }
                }
          });
          const responseBody = await sourceResponse.json();
          let hitsArray = responseBody.response.hits.hits;
          if (Array.isArray(hitsArray) && hitsArray.length > 0) {
            latestSliTimestampISO = responseBody.response.hits.hits[0].fields["@timestamp"];
            latestSliTimestampMillis = Date.parse(latestSliTimestampISO);
            return latestSliTimestampMillis;
          }
        }, {
          message: 'Waiting for the next document in the source index.',
          intervals: [1_000],
          timeout: 600000,
        }).toBeGreaterThan(testStartTime);
      } catch (error) {
        console.warn('Test failed. Continuing with the teardown...');
        await teardown(request, sloName, sloId);
      }
    });
  console.log('The last @timestamp of the source data:', latestSliTimestampISO);

  const sli = async () => {
    await test.step('From source to rollup data.', async () => {
      console.log('Waiting for the next document in ".slo-observability.sli-v3*" indices...');
      try {
        await expect.poll(async () => {
          let sliResponseBody = await request.post(`${ELASTICSEARCH_HOST}/.slo-observability.sli-v3*/_async_search`, {
                data: {
                  "sort": [
                    {
                      "@timestamp": {
                        "order": "desc",
                        "format": "strict_date_optional_time",
                        "unmapped_type": "boolean"
                      }
                    },
                    {
                      "_doc": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                      }
                    }
                  ],
                  "track_total_hits": false,
                  "fields": [
                    {
                      "field": "*",
                      "include_unmapped": "true"
                    },
                    {
                      "field": "@timestamp",
                      "format": "strict_date_optional_time"
                    },
                    {
                      "field": "event.ingested",
                      "format": "strict_date_optional_time"
                    }
                  ],
                  "size": 500,
                  "version": true,
                  "script_fields": {},
                  "stored_fields": [
                    "*"
                  ],
                  "runtime_mappings": {},
                  "_source": false,
                  "query": {
                    "bool": {
                      "must": [],
                      "filter": [
                        {
                          "range": {
                            "@timestamp": {
                              "format": "strict_date_optional_time",
                              "gte": "now-15m",
                              "lte": "now"
                            }
                          }
                        },
                        {
                          "match_phrase": {
                            "slo.id": sloId
                          }
                        }
                      ],
                      "should": [],
                      "must_not": []
                    }
                  }
                }
            });
            const responseBody = JSON.parse(await sliResponseBody.text());
            let hitsArray = responseBody.response.hits.hits;
            if (Array.isArray(hitsArray) && hitsArray.length > 0) {
              return Date.parse(responseBody.response.hits.hits[0].fields["@timestamp"]);
            }
          }, {
            message: 'Waiting for the next document in the ".slo-observability.sli-v3*" index.',
            intervals: [1_000],
            timeout: 600000,
          }).toEqual(latestSliTimestampMillis);
        } catch (error) {
          console.warn('Test failed. Continuing with the teardown...');
          await teardown(request, sloName, sloId);
        }
      });
    }

  const sloSummary = async () => {  
    await test.step('From source to summary.', async () => {
      console.log('Waiting for the update of the ".slo-observability.summary-v3.2" index...');
      await expect.poll(async () => {
        let sloSummaryResponseBody = await request.post(`${ELASTICSEARCH_HOST}/.slo-observability.summary-v3.2/_async_search`, {
              data: {
                "sort": [
                  {
                    "latestSliTimestamp": {
                      "order": "desc",
                      "format": "strict_date_optional_time",
                      "unmapped_type": "boolean"
                    }
                  },
                  {
                    "_doc": {
                      "order": "desc",
                      "unmapped_type": "boolean"
                    }
                  }
                ],
                "track_total_hits": false,
                "fields": [
                  {
                    "field": "*",
                    "include_unmapped": "true"
                  },
                  {
                    "field": "latestSliTimestamp",
                    "format": "strict_date_optional_time"
                  },
                  {
                    "field": "slo.createdAt",
                    "format": "strict_date_optional_time"
                  },
                  {
                    "field": "slo.updatedAt",
                    "format": "strict_date_optional_time"
                  },
                  {
                    "field": "summaryUpdatedAt",
                    "format": "strict_date_optional_time"
                  }
                ],
                "size": 500,
                "version": true,
                "script_fields": {},
                "stored_fields": [
                  "*"
                ],
                "runtime_mappings": {},
                "_source": false,
                "query": {
                  "bool": {
                    "must": [],
                    "filter": [
                      {
                        "range": {
                          "latestSliTimestamp": {
                            "format": "strict_date_optional_time",
                            "gte": "now-15m",
                            "lte": "now"
                          }
                        }
                      },
                      {
                        "match_phrase": {
                          "slo.id": sloId
                        }
                      }
                    ],
                    "should": [],
                    "must_not": []
                  }
                }
              }
          });
          const responseBody = JSON.parse(await sloSummaryResponseBody.text());
          let hitsArray = responseBody.response.hits.hits;
          if (Array.isArray(hitsArray) && hitsArray.length > 0) {
            return Date.parse(responseBody.response.hits.hits[0].fields["latestSliTimestamp"]);
          }
        }, {
          message: 'Waiting for the update of the ".slo-observability.summary-v3.2" index.',
          intervals: [1_000],
          timeout: 600000,
        }).toEqual(latestSliTimestampMillis)
      });
    };
  await Promise.all([sli(), sloSummary()]);
  await teardown(request, sloName, sloId);
});

test('sli.kql.custom', async({request}) => {
  test.setTimeout(600000);
  const sloName = "[Playwright Test] Custom query";
  const testStartTime = Date.now();
  let sloCreateResponse: any;
  let sloId: string;
  let latestSliTimestampISO!: string;
  let latestSliTimestampMillis: number;
  
  const histogramMetric = await test.step('Create SLO [sli.kql.custom].', async () => {
    sloCreateResponse = await request.post('/api/observability/slos', {
        data: {
            "name": sloName,
            "description":"",
            "indicator":{
                "type":
                    "sli.kql.custom",
                    "params":{
                        "filter":"",
                        "good":"transaction.duration.us<= 10000000",
                        "total":"",
                        "index":"traces-apm*,apm-*,logs-apm*,apm-*,metrics-apm*,apm-*",
                        "timestampField":"@timestamp"
                        }
            },
            "budgetingMethod":"occurrences",
            "timeWindow":{
                "duration":"30d",
                "type":"rolling"
            },
            "objective":{"target":0.17}
        }
    })  
    expect(sloCreateResponse.status()).toBe(200);
    if (sloCreateResponse.status() >= 200 && sloCreateResponse.status() < 300) {
        console.log("SLO", `"${sloName}"`, "has been created.")
    }
    return JSON.parse(await sloCreateResponse.text());
  });
  sloId = histogramMetric.id;
  console.log('slo.id:', sloId);

  await test.step('Get the last timestamp of the source data.', async () => {
    console.log("Waiting for the next document in the source index...");
    try {
      await expect.poll(async () => {
        let sourceResponse = await request.post(`${ELASTICSEARCH_HOST}/metrics-*/_async_search`, {
              data: {
                  "sort": [
                    {
                      "@timestamp": {
                        "order": "desc",
                        "format": "strict_date_optional_time",
                        "unmapped_type": "boolean"
                      }
                    },
                    {
                      "_doc": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                      }
                    }
                  ],
                  "track_total_hits": false,
                  "fields": [
                    {
                      "field": "*",
                      "include_unmapped": "true"
                    },
                    {
                      "field": "@timestamp",
                      "format": "strict_date_optional_time"
                    }
                  ],
                  "size": 500,
                  "version": true,
                  "script_fields": {},
                  "stored_fields": [
                    "*"
                  ],
                  "runtime_mappings": {},
                  "_source": false,
                  "query": {
                    "bool": {
                      "must": [],
                      "filter": [
                        {
                          "range": {
                            "@timestamp": {
                              "gte": "now-15m",
                              "lte": "now"
                            }
                          }
                        },
                        {
                          "exists": {
                            "field": "event.outcome"
                          }
                        },
                        {
                          "exists": {
                            "field": "transaction.duration.summary"
                          }
                        },
                        {
                          "match_phrase": {
                            "data_stream.dataset": "apm.transaction.1m"
                          }
                        }
                      ],
                      "should": [],
                      "must_not": []
                    }
                  }
                }
          });
          const responseBody = await sourceResponse.json();
          let hitsArray = responseBody.response.hits.hits;
          if (Array.isArray(hitsArray) && hitsArray.length > 0) {
            latestSliTimestampISO = responseBody.response.hits.hits[0].fields["@timestamp"];
            latestSliTimestampMillis = Date.parse(latestSliTimestampISO);
            return latestSliTimestampMillis;
          }
        }, {
          message: 'Waiting for the next document in the source index.',
          intervals: [1_000],
          timeout: 600000,
        }).toBeGreaterThan(testStartTime);
      } catch (error) {
        console.warn('Test failed. Continuing with the teardown...');
        await teardown(request, sloName, sloId);
      }
    });
  console.log('The last @timestamp of the source data:', latestSliTimestampISO);

  const sli = async () => {
    await test.step('From source to rollup data.', async () => {
    console.log('Waiting for the next document in ".slo-observability.sli-v3*" indices...');
    try {
      await expect.poll(async () => {
          let sliResponseBody = await request.post(`${ELASTICSEARCH_HOST}/.slo-observability.sli-v3*/_async_search`, {
                data: {
                  "sort": [
                    {
                      "@timestamp": {
                        "order": "desc",
                        "format": "strict_date_optional_time",
                        "unmapped_type": "boolean"
                      }
                    },
                    {
                      "_doc": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                      }
                    }
                  ],
                  "track_total_hits": false,
                  "fields": [
                    {
                      "field": "*",
                      "include_unmapped": "true"
                    },
                    {
                      "field": "@timestamp",
                      "format": "strict_date_optional_time"
                    },
                    {
                      "field": "event.ingested",
                      "format": "strict_date_optional_time"
                    }
                  ],
                  "size": 500,
                  "version": true,
                  "script_fields": {},
                  "stored_fields": [
                    "*"
                  ],
                  "runtime_mappings": {},
                  "_source": false,
                  "query": {
                    "bool": {
                      "must": [],
                      "filter": [
                        {
                          "range": {
                            "@timestamp": {
                              "format": "strict_date_optional_time",
                              "gte": "now-15m",
                              "lte": "now"
                            }
                          }
                        },
                        {
                          "match_phrase": {
                            "slo.id": sloId
                          }
                        }
                      ],
                      "should": [],
                      "must_not": []
                    }
                  }
                }
            });
          const responseBody = JSON.parse(await sliResponseBody.text());
          let hitsArray = responseBody.response.hits.hits;
          if (Array.isArray(hitsArray) && hitsArray.length > 0) {
            return Date.parse(responseBody.response.hits.hits[0].fields["@timestamp"]);
          }
          }, {
            message: 'Waiting for the next document in ".slo-observability.sli-v3*" indices.',
            intervals: [1_000],
            timeout: 600000,
          }).toEqual(latestSliTimestampMillis)
        } catch (error) {
          console.warn('Test failed. Continuing with the teardown...');
          await teardown(request, sloName, sloId);
        }
    });
  }
  
  const sloSummary = async () => {  
    await test.step('From source to summary.', async () => {
      console.log('Waiting for the update of the ".slo-observability.summary-v3.2" index...');
      await expect.poll(async () => {
        let sloSummaryResponseBody = await request.post(`${ELASTICSEARCH_HOST}/.slo-observability.summary-v3.2/_async_search`, {
              data: {
                "sort": [
                  {
                    "latestSliTimestamp": {
                      "order": "desc",
                      "format": "strict_date_optional_time",
                      "unmapped_type": "boolean"
                    }
                  },
                  {
                    "_doc": {
                      "order": "desc",
                      "unmapped_type": "boolean"
                    }
                  }
                ],
                "track_total_hits": false,
                "fields": [
                  {
                    "field": "*",
                    "include_unmapped": "true"
                  },
                  {
                    "field": "latestSliTimestamp",
                    "format": "strict_date_optional_time"
                  },
                  {
                    "field": "slo.createdAt",
                    "format": "strict_date_optional_time"
                  },
                  {
                    "field": "slo.updatedAt",
                    "format": "strict_date_optional_time"
                  },
                  {
                    "field": "summaryUpdatedAt",
                    "format": "strict_date_optional_time"
                  }
                ],
                "size": 500,
                "version": true,
                "script_fields": {},
                "stored_fields": [
                  "*"
                ],
                "runtime_mappings": {},
                "_source": false,
                "query": {
                  "bool": {
                    "must": [],
                    "filter": [
                      {
                        "range": {
                          "latestSliTimestamp": {
                            "format": "strict_date_optional_time",
                            "gte": "now-15m",
                            "lte": "now"
                          }
                        }
                      },
                      {
                        "match_phrase": {
                          "slo.id": sloId
                        }
                      }
                    ],
                    "should": [],
                    "must_not": []
                  }
                }
              }
          });
          const responseBody = JSON.parse(await sloSummaryResponseBody.text());
          let hitsArray = responseBody.response.hits.hits;
          if (Array.isArray(hitsArray) && hitsArray.length > 0) {
            return Date.parse(responseBody.response.hits.hits[0].fields["latestSliTimestamp"]);
          }
        }, {
          message: 'Waiting for the update of the ".slo-observability.summary-v3.2" index.',
          intervals: [1_000],
          timeout: 600000,
        }).toEqual(latestSliTimestampMillis)
      });
    };
  await Promise.all([sli(), sloSummary()]);
  await teardown(request, sloName, sloId);
})
