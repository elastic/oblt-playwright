import {test, expect} from '@playwright/test';

test('sli.apm.transactionDuration', async({request}) => {
  test.setTimeout(0);
  const sloName = "[Playwright Test] APM latency";
  const testStartTime = Date.now();
  let sloCreateResponse;
  let sloId;
  let sourceResponse;
  let sourceTimestamp;

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
    const responseBody = JSON.parse(await sloCreateResponse.text());
    return responseBody;
  });
  sloId = apmTransactionDuration.id;
  console.log('slo.id:', sloId);
  
  await test.step('Get the last timestamp of the source data.', async () => {
    console.log("Waiting for the next document in the source index...");
    await expect.poll(async () => {
      sourceResponse = await request.post(`${process.env.ELASTIC_ES}/metrics-*/_async_search`, {
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
        sourceTimestamp = responseBody.response.hits.hits[0].fields["@timestamp"];
        const timestampMillis = Date.parse(sourceTimestamp);
        sourceResponse = Date.parse(sourceTimestamp);
        return timestampMillis;
      }, {
        message: 'Waiting for the next document in the source index.',
        intervals: [1_000],
        timeout: 0,
      }).toBeGreaterThan(testStartTime);
    });
  console.log('The last @timestamp of the source data:', sourceTimestamp);
  const startTime = Date.now();


  await test.step('Poll SLO indices for a document with the source data timestamp.', async () => {
    console.log('Waiting for the next document in the ".slo-observability.sli-v3*" indices...');
    await expect.poll(async () => {
      let sloResponse = await request.post(`${process.env.ELASTIC_ES}/.slo-observability.sli-v3*/_async_search`, {
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
        const responseBody = JSON.parse(await sloResponse.text());
        const sloTimestamp = responseBody.response.hits.hits[0].fields["@timestamp"];
        const timestampMillis = Date.parse(sloTimestamp);
        return timestampMillis;
      }, {
        message: 'Waiting for the next document in the ".slo-observability.sli-v3*" index.',
        intervals: [1_000],
        timeout: 0,
      }).toEqual(sourceResponse);
    });
  const endTime = Date.now();

  await test.step(`Delete SLO ${sloName}.`, async () => {
    let deleteResponse = await request.delete(`api/observability/slos/${sloId}`, {
        data: {
        }
    });
    expect(deleteResponse.status()).toBe(204);
    });

  await test.step('Calculate the time SLO transforms took to run.', async () => {
    let result = endTime - startTime;
    expect(result).toBeGreaterThan(0);
    console.log(`SLO "${sloName}" transforms took:`, result, 'ms.');
    });
});

test('sli.apm.transactionErrorRate', async({request}) => {
  test.setTimeout(0);
  const sloName = "[Playwright Test] APM availability";
  const testStartTime = Date.now();
  let sloCreateResponse;
  let sloId;
  let sourceResponse;
  let sourceTimestamp;

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
    const responseBody = JSON.parse(await sloCreateResponse.text());
    return responseBody;
  });
  sloId = apmTransactionErrorRate.id;
  console.log('slo.id:', sloId);

  await test.step('Get the last timestamp of the source data.', async () => {
    console.log("Waiting for the next document in the source index...");
    await expect.poll(async () => {
      sourceResponse = await request.post(`${process.env.ELASTIC_ES}/metrics-*/_async_search`, {
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
        sourceTimestamp = responseBody.response.hits.hits[0].fields["@timestamp"];
        const timestampMillis = Date.parse(sourceTimestamp);
        sourceResponse = Date.parse(sourceTimestamp);
        return timestampMillis;
      }, {
        message: 'Waiting for the next document in the source index.',
        intervals: [1_000],
        timeout: 0,
      }).toBeGreaterThan(testStartTime);
    });
  console.log('The last @timestamp of the source data:', sourceTimestamp);
  const startTime = Date.now();

  await test.step('Poll SLO indices for a document with certain timestamp.', async () => {
    console.log('Waiting for the next document in the ".slo-observability.sli-v3*" indices...');
    await expect.poll(async () => {
      let sloResponse = await request.post(`${process.env.ELASTIC_ES}/.slo-observability.sli-v3*/_async_search`, {
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
        const responseBody = JSON.parse(await sloResponse.text());
        const sloTimestamp = responseBody.response.hits.hits[0].fields["@timestamp"];
        const timestampMillis = Date.parse(sloTimestamp);
        return timestampMillis;
      }, {
        message: 'Waiting for the next document in the ".slo-observability.sli-v3*" index.',
        intervals: [1_000],
        timeout: 0,
      }).toEqual(sourceResponse);
    });
  const endTime = Date.now();

  await test.step(`Delete SLO ${sloName}.`, async () => {
    let deleteResponse = await request.delete(`api/observability/slos/${sloId}`, {
        data: {
        }
    });
    expect(deleteResponse.status()).toBe(204);
    });

  await test.step('Calculate the time SLO transforms took to run.', async () => {
    let result = endTime - startTime;
    expect(result).toBeGreaterThan(0);
    console.log(`SLO "${sloName}" transforms took:`, result, 'ms.');
    });
});