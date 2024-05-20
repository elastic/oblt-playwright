import {test, expect} from '@playwright/test';

test('sli.apm.transactionDuration', async({request}) => {
  test.setTimeout(600000);
  const sloName = "[Playwright Test] APM latency";
  const testStartTime = Date.now();
  let sloCreateResponse;
  let sloId;
  let latestSliTimestampISO;
  let latestSliTimestampMillis;

  async function teardown() {
    console.log(`Deleting SLO "${sloName}"...`);
    let deleteResponse = await request.delete(`api/observability/slos/${sloId}`, {
        data: {
        }
    });
    expect.soft(deleteResponse.status()).toBe(204);
    if (deleteResponse.status() == 204) {
      console.log(`SLO "${sloName}" has been deleted.`);
    }
  }

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
    try {
      await expect.poll(async () => {
        latestSliTimestampMillis = await request.post(`${process.env.ELASTICSEARCH_HOST}/metrics-*/_async_search`, {
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
          const responseBody = await latestSliTimestampMillis.json();
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
        await teardown();
      }
  });
  console.log('The last @timestamp of the source data:', latestSliTimestampISO);

  const sli = async () => {
    await test.step('Poll sli indices.', async () => {
      console.log('Waiting for the next document in ".slo-observability.sli-v3*" indices...');
      try {
        await expect.poll(async () => {
          let sliResponseBody = await request.post(`${process.env.ELASTICSEARCH_HOST}/.slo-observability.sli-v3*/_async_search`, {
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
              const sliTimestamp = responseBody.response.hits.hits[0].fields["@timestamp"];
              const timestampMillis = Date.parse(sliTimestamp);
              return timestampMillis;
            }
          }, {
            message: 'Waiting for the next document in the ".slo-observability.sli-v3*" index.',
            intervals: [1_000],
            timeout: 600000,
          }).toEqual(latestSliTimestampMillis);
        } catch (error) {
          console.warn('Test failed. Continuing with the teardown...');
          await teardown();
        }
      });
  }

  const sloSummary = async () => {  
    await test.step('Poll summary index.', async () => {
      console.log('Waiting for the update of the ".slo-observability.summary-v3.2" index...');
      await expect.poll(async () => {
        let sloSummaryResponseBody = await request.post(`${process.env.ELASTICSEARCH_HOST}/.slo-observability.summary-v3.2/_async_search`, {
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
            const sliTimestampSummary = responseBody.response.hits.hits[0].fields["latestSliTimestamp"];
            const timestampMillis = Date.parse(sliTimestampSummary);
            return timestampMillis;
          }
        }, {
          message: 'Waiting for the update of the ".slo-observability.summary-v3.2" index.',
          intervals: [1_000],
          timeout: 600000,
        }).toEqual(latestSliTimestampMillis)
      });
    }

  await Promise.all([sli(), sloSummary()]);

  await test.step('Teardown.', async () => {
    console.log(`Deleting SLO "${sloName}"...`);
    let deleteResponse = await request.delete(`api/observability/slos/${sloId}`, {
        data: {
        }
    });
    expect.soft(deleteResponse.status()).toBe(204);
    if (deleteResponse.status() == 204) {
      console.log(`SLO "${sloName}" has been deleted.`);
    }
    });
});

test('sli.apm.transactionErrorRate', async({request}) => {
  test.setTimeout(600000);
  const sloName = "[Playwright Test] APM availability";
  const testStartTime = Date.now();
  let sloCreateResponse;
  let sloId;
  let latestSliTimestampISO;
  let latestSliTimestampMillis;

  async function teardown() {
    console.log(`Deleting SLO "${sloName}"...`);
    let deleteResponse = await request.delete(`api/observability/slos/${sloId}`, {
        data: {
        }
    });
    expect.soft(deleteResponse.status()).toBe(204);
    if (deleteResponse.status() == 204) {
      console.log(`SLO "${sloName}" has been deleted.`);
    }
  }

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
    try {
      await expect.poll(async () => {
        latestSliTimestampMillis = await request.post(`${process.env.ELASTICSEARCH_HOST}/metrics-*/_async_search`, {
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
          const responseBody = await latestSliTimestampMillis.json();
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
        await teardown();
      }
    });
  console.log('The last @timestamp of the source data:', latestSliTimestampISO);

  const sli = async () => {
    await test.step('Poll sli indices.', async () => {
      console.log('Waiting for the next document in ".slo-observability.sli-v3*" indices...');
      try {
        await expect.poll(async () => {
          let sliResponseBody = await request.post(`${process.env.ELASTICSEARCH_HOST}/.slo-observability.sli-v3*/_async_search`, {
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
              const sliTimestamp = responseBody.response.hits.hits[0].fields["@timestamp"];
              const timestampMillis = Date.parse(sliTimestamp);
              return timestampMillis;
            }
          }, {
            message: 'Waiting for the next document in the ".slo-observability.sli-v3*" index.',
            intervals: [1_000],
            timeout: 600000,
          }).toEqual(latestSliTimestampMillis);
        } catch (error) {
          console.warn('Test failed. Continuing with the teardown...');
          await teardown();
        }
      });
  }

  const sloSummary = async () => {  
    await test.step('Poll summary index.', async () => {
      console.log('Waiting for the update of the ".slo-observability.summary-v3.2" index...');
      await expect.poll(async () => {
        let sloSummaryResponseBody = await request.post(`${process.env.ELASTICSEARCH_HOST}/.slo-observability.summary-v3.2/_async_search`, {
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
            const sliTimestampSummary = responseBody.response.hits.hits[0].fields["latestSliTimestamp"];
            const timestampMillis = Date.parse(sliTimestampSummary);
            return timestampMillis;
          }
        }, {
          message: 'Waiting for the update of the ".slo-observability.summary-v3.2" index.',
          intervals: [1_000],
          timeout: 600000,
        }).toEqual(latestSliTimestampMillis)
      });
  }
  
  await Promise.all([sli(), sloSummary()]);

  await test.step('Teardown.', async () => {
    console.log(`Deleting SLO "${sloName}"...`);
    let deleteResponse = await request.delete(`api/observability/slos/${sloId}`, {
        data: {
        }
    });
    expect.soft(deleteResponse.status()).toBe(204);
    if (deleteResponse.status() == 204) {
      console.log(`SLO "${sloName}" has been deleted.`);
    }
    });
});

test('sli.histogram.custom', async({request}) => {
  test.setTimeout(600000);
  const sloName = "[Playwright Test] Histogram metric";
  const testStartTime = Date.now();
  let sloCreateResponse;
  let sloId;
  let latestSliTimestampISO;
  let latestSliTimestampMillis;

  async function teardown() {
    console.log(`Deleting SLO "${sloName}"...`);
    let deleteResponse = await request.delete(`api/observability/slos/${sloId}`, {
        data: {
        }
    });
    expect.soft(deleteResponse.status()).toBe(204);
    console.log(`SLO "${sloName}" has been deleted.`);
  }
  
  const histogramMetric = await test.step('Create SLO [sli.histogram.custom].', async () => {
    sloCreateResponse = await request.post('/api/observability/slos', {
        data: {
            "name": sloName,
            "description":"",
            "indicator":{
                "type":
                    "sli.histogram.custom",
                    "params":{
                        "filter":"",
                        "good":{"field":"transaction.duration.histogram","aggregation":"value_count","filter":""},
			                  "total":{"field":"transaction.duration.histogram","aggregation":"value_count","filter":""},
                        "index":"traces-apm*,apm-*,logs-apm*,apm-*,metrics-apm*,apm-*",
                        "timestampField":"@timestamp"
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
  sloId = histogramMetric.id;
  console.log('slo.id:', sloId);

  await test.step('Get the last timestamp of the source data.', async () => {
    console.log("Waiting for the next document in the source index...");
    try {
      await expect.poll(async () => {
        let sourceResponseBody = await request.post(`${process.env.ELASTICSEARCH_HOST}/metrics-*/_async_search`, {
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
          const responseBody = await sourceResponseBody.json();
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
        await teardown();
      }
    });
  console.log('The last @timestamp of the source data:', latestSliTimestampISO);

  const sli = async () => {
    await test.step('Poll sli indices.', async () => {
    console.log('Waiting for the next document in ".slo-observability.sli-v3*" indices...');
    try {
      await expect.poll(async () => {
          let sliResponseBody = await request.post(`${process.env.ELASTICSEARCH_HOST}/.slo-observability.sli-v3*/_async_search`, {
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
            const sliTimestamp = responseBody.response.hits.hits[0].fields["@timestamp"];
            let timestampMillis = Date.parse(sliTimestamp);
            return timestampMillis;
          }
          }, {
            message: 'Waiting for the next document in ".slo-observability.sli-v3*" indices.',
            intervals: [1_000],
            timeout: 600000,
          }).toEqual(latestSliTimestampMillis)
        } catch (error) {
          console.warn('Test failed. Continuing with the teardown...');
          await teardown();
        }
    });
  }
  
  const sloSummary = async () => {  
    await test.step('Poll summary index.', async () => {
      console.log('Waiting for the update of the ".slo-observability.summary-v3.2" index...');
      await expect.poll(async () => {
        let sloSummaryResponseBody = await request.post(`${process.env.ELASTICSEARCH_HOST}/.slo-observability.summary-v3.2/_async_search`, {
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
            const sliTimestampSummary = responseBody.response.hits.hits[0].fields["latestSliTimestamp"];
            const timestampMillis = Date.parse(sliTimestampSummary);
            return timestampMillis;
          }
        }, {
          message: 'Waiting for the update of the ".slo-observability.summary-v3.2" index.',
          intervals: [1_000],
          timeout: 600000,
        }).toEqual(latestSliTimestampMillis)
      });
  }
  
  await Promise.all([sli(), sloSummary()]);

  await test.step('Teardown.', async () => {
    console.log(`Deleting SLO "${sloName}"...`);
    let deleteResponse = await request.delete(`api/observability/slos/${sloId}`, {
        data: {
        }
    });
    expect(deleteResponse.status()).toBe(204);
    if (deleteResponse.status() == 204) {
      console.log(`SLO "${sloName}" has been deleted.`);
    }
    });
})