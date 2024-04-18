import {test, expect} from '@playwright/test';

test.describe.serial('SLO performance tests', () => {
     test('sli.apm.transactionDuration', async({request}) => {
      test.setTimeout(0);
      const sloName = "[Playwright Test] APM latency";
      const testStartTime = Date.now();
      let sloCreateResponse;
      let sourceResponse;
      let sourceTimestamp;
      let sloId;

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


      await test.step('Getting the time for SLO transforms to complete', async () => {
        sloId = apmTransactionDuration.id;
        console.log('slo.id:', sloId);
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

      await test.step('Calculate the time SLO transforms took to run.', async () => {
        let result = endTime - startTime;
        console.log('SLO transforms took:', result, 'ms.')
        return result;
        });
    });
});