import { test, expect } from '@playwright/test';

test('APM service metrics', async ({ request }) => {
    await test.step('query_01', async () => {
        let response = await request.post(`${process.env.ELASTICSEARCH_HOST}/${process.env.REMOTE_CCS_CLUSTER}:metrics-apm*%2Capm-*/_async_search`, {
            data: {
                "track_total_hits": false,
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "terms": {
                                    "processor.event": [
                                        "metric"
                                    ]
                                }
                            }
                        ],
                        "must": [
                            {
                                "bool": {
                                    "filter": [
                                        {
                                            "term": {
                                                "service.name": "opbeans-go"
                                            }
                                        },
                                        {
                                            "term": {
                                                "transaction.type": "request"
                                            }
                                        },
                                        {
                                            "range": {
                                                "@timestamp": {
                                                    "gte": "now-1d",
                                                    "lte": "now"
                                                }
                                            }
                                        },
                                        {
                                            "exists": {
                                                "field": "span.self_time.sum.us"
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "sum_all_self_times": {
                        "sum": {
                            "field": "span.self_time.sum.us"
                        }
                    },
                    "types": {
                        "terms": {
                            "field": "span.type",
                            "size": 20,
                            "order": {
                                "_count": "desc"
                            }
                        },
                        "aggs": {
                            "subtypes": {
                                "terms": {
                                    "field": "span.subtype",
                                    "missing": "",
                                    "size": 20,
                                    "order": {
                                        "_count": "desc"
                                    }
                                },
                                "aggs": {
                                    "total_self_time_per_subtype": {
                                        "sum": {
                                            "field": "span.self_time.sum.us"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "by_date": {
                        "date_histogram": {
                            "field": "@timestamp",
                            "fixed_interval": "1800s",
                            "min_doc_count": 0,
                            "extended_bounds": {
                                "min": "now-1d",
                                "max": "now"
                            }
                        },
                        "aggs": {
                            "sum_all_self_times": {
                                "sum": {
                                    "field": "span.self_time.sum.us"
                                }
                            },
                            "types": {
                                "terms": {
                                    "field": "span.type",
                                    "size": 20,
                                    "order": {
                                        "_count": "desc"
                                    }
                                },
                                "aggs": {
                                    "subtypes": {
                                        "terms": {
                                            "field": "span.subtype",
                                            "missing": "",
                                            "size": 20,
                                            "order": {
                                                "_count": "desc"
                                            }
                                        },
                                        "aggs": {
                                            "total_self_time_per_subtype": {
                                                "sum": {
                                                    "field": "span.self_time.sum.us"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        expect(response.status()).toBe(200);
    });

    await test.step('query_02', async () => {
        let response = await request.post(`${process.env.ELASTICSEARCH_HOST}/${process.env.REMOTE_CCS_CLUSTER}:metrics-apm*%2Capm-*/_async_search`, {
            data: {
                "track_total_hits": 1,
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "terms": {
                                    "processor.event": [
                                        "metric"
                                    ]
                                }
                            }
                        ],
                        "must": [
                            {
                                "bool": {
                                    "filter": [
                                        {
                                            "term": {
                                                "service.name": "opbeans-go"
                                            }
                                        },
                                        {
                                            "range": {
                                                "@timestamp": {
                                                    "gte": "now-1d",
                                                    "lte": "now"
                                                }
                                            }
                                        },
                                        {
                                            "bool": {
                                                "filter": [
                                                    {
                                                        "exists": {
                                                            "field": "system.memory.actual.free"
                                                        }
                                                    },
                                                    {
                                                        "exists": {
                                                            "field": "system.memory.total"
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "timeseriesData": {
                        "date_histogram": {
                            "field": "@timestamp",
                            "fixed_interval": "1800s",
                            "min_doc_count": 0,
                            "extended_bounds": {
                                "min": "now-1d",
                                "max": "now"
                            }
                        },
                        "aggs": {
                            "memoryUsedAvg": {
                                "avg": {
                                    "script": {
                                        "lang": "painless",
                                        "source": "\n    def freeMemory = (double)$('system.memory.actual.free', 0);\n    def totalMemory = (double)$('system.memory.total', -1);\n    if (freeMemory >= 0 && totalMemory > 0) {\n      return 1 - freeMemory / totalMemory;\n    }\n    return null;\n  "
                                    }
                                }
                            },
                            "memoryUsedMax": {
                                "max": {
                                    "script": {
                                        "lang": "painless",
                                        "source": "\n    def freeMemory = (double)$('system.memory.actual.free', 0);\n    def totalMemory = (double)$('system.memory.total', -1);\n    if (freeMemory >= 0 && totalMemory > 0) {\n      return 1 - freeMemory / totalMemory;\n    }\n    return null;\n  "
                                    }
                                }
                            }
                        }
                    },
                    "memoryUsedAvg": {
                        "avg": {
                            "script": {
                                "lang": "painless",
                                "source": "\n    def freeMemory = (double)$('system.memory.actual.free', 0);\n    def totalMemory = (double)$('system.memory.total', -1);\n    if (freeMemory >= 0 && totalMemory > 0) {\n      return 1 - freeMemory / totalMemory;\n    }\n    return null;\n  "
                            }
                        }
                    },
                    "memoryUsedMax": {
                        "max": {
                            "script": {
                                "lang": "painless",
                                "source": "\n    def freeMemory = (double)$('system.memory.actual.free', 0);\n    def totalMemory = (double)$('system.memory.total', -1);\n    if (freeMemory >= 0 && totalMemory > 0) {\n      return 1 - freeMemory / totalMemory;\n    }\n    return null;\n  "
                            }
                        }
                    }
                }
            }
        });
        expect(response.status()).toBe(200);
    });

    await test.step('query_03', async () => {
        let response = await request.post(`${process.env.ELASTICSEARCH_HOST}/${process.env.REMOTE_CCS_CLUSTER}:metrics-apm*%2Capm-*/_async_search`, {
            data: {
                "track_total_hits": 1,
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "terms": {
                                    "processor.event": [
                                        "metric"
                                    ]
                                }
                            }
                        ],
                        "must": [
                            {
                                "bool": {
                                    "filter": [
                                        {
                                            "term": {
                                                "service.name": "opbeans-go"
                                            }
                                        },
                                        {
                                            "range": {
                                                "@timestamp": {
                                                    "gte": "now-1d",
                                                    "lte": "now"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "timeseriesData": {
                        "date_histogram": {
                            "field": "@timestamp",
                            "fixed_interval": "1800s",
                            "min_doc_count": 0,
                            "extended_bounds": {
                                "min": "now-1d",
                                "max": "now"
                            }
                        },
                        "aggs": {
                            "systemCPUAverage": {
                                "avg": {
                                    "field": "system.cpu.total.norm.pct"
                                }
                            },
                            "systemCPUMax": {
                                "max": {
                                    "field": "system.cpu.total.norm.pct"
                                }
                            },
                            "processCPUAverage": {
                                "avg": {
                                    "field": "system.process.cpu.total.norm.pct"
                                }
                            },
                            "processCPUMax": {
                                "max": {
                                    "field": "system.process.cpu.total.norm.pct"
                                }
                            }
                        }
                    },
                    "systemCPUAverage": {
                        "avg": {
                            "field": "system.cpu.total.norm.pct"
                        }
                    },
                    "systemCPUMax": {
                        "max": {
                            "field": "system.cpu.total.norm.pct"
                        }
                    },
                    "processCPUAverage": {
                        "avg": {
                            "field": "system.process.cpu.total.norm.pct"
                        }
                    },
                    "processCPUMax": {
                        "max": {
                            "field": "system.process.cpu.total.norm.pct"
                        }
                    }
                }
            }
        });
        expect(response.status()).toBe(200);
    });
});

test('APM transaction metrics', async ({ request }) => {
    await test.step('query_01', async () => {
        let response = await request.post(`${process.env.ELASTICSEARCH_HOST}/${process.env.REMOTE_CCS_CLUSTER}:metrics-apm*%2Capm-*/_async_search`, {
            data: {
                "track_total_hits": 1,
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "terms": {
                                    "processor.event": [
                                        "metric"
                                    ]
                                }
                            }
                        ],
                        "must": [
                            {
                                "bool": {
                                    "filter": [
                                        {
                                            "bool": {
                                                "filter": [
                                                    {
                                                        "bool": {
                                                            "filter": [
                                                                {
                                                                    "term": {
                                                                        "service.name": "opbeans-ruby"
                                                                    }
                                                                },
                                                                {
                                                                    "term": {
                                                                        "transaction.type": "request"
                                                                    }
                                                                },
                                                                {
                                                                    "term": {
                                                                        "transaction.name": "Rack"
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "bool": {
                                                            "filter": [
                                                                {
                                                                    "exists": {
                                                                        "field": "transaction.duration.histogram"
                                                                    }
                                                                }
                                                            ],
                                                            "must_not": [
                                                                {
                                                                    "terms": {
                                                                        "metricset.interval": [
                                                                            "10m", "60m"
                                                                        ]
                                                                    }
                                                                },
                                                                {
                                                                    "term": {
                                                                        "metricset.name": "service_transaction"
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "range": {
                                                "@timestamp": {
                                                    "gte": "now-1d",
                                                    "lte": "now"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "duration_min": {
                        "min": {
                            "field": "transaction.duration.histogram"
                        }
                    },
                    "duration_max": {
                        "max": {
                            "field": "transaction.duration.histogram"
                        }
                    }
                }
            }
        });
        expect(response.status()).toBe(200);
    });

    await test.step('query_02', async () => {
        let response = await request.post(`${process.env.ELASTICSEARCH_HOST}/${process.env.REMOTE_CCS_CLUSTER}:metrics-apm*%2Capm-*/_async_search`, {
            data: {
                "track_total_hits": false,
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "terms": {
                                    "processor.event": [
                                        "metric"
                                    ]
                                }
                            }
                        ],
                        "must": [
                            {
                                "bool": {
                                    "filter": [
                                        {
                                            "bool": {
                                                "filter": [
                                                    {
                                                        "exists": {
                                                            "field": "transaction.duration.histogram"
                                                        }
                                                    }
                                                ],
                                                "must_not": [
                                                    {
                                                        "terms": {
                                                            "metricset.interval": [
                                                                "10m",
                                                                "60m"
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "term": {
                                                            "metricset.name": "service_transaction"
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "range": {
                                                "@timestamp": {
                                                    "gte": "now-1d",
                                                    "lte": "now"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "versions": {
                        "terms": {
                            "field": "service.runtime.version"
                        }
                    }
                }
            }
        });
        expect(response.status()).toBe(200);
    });

    await test.step('query_03', async () => {
        let response = await request.post(`${process.env.ELASTICSEARCH_HOST}/${process.env.REMOTE_CCS_CLUSTER}:metrics-apm*%2Capm-*/_async_search`, {
            data: {
                "track_total_hits": true,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "terms": {
                                    "processor.event": [
                                        "metric"
                                    ]
                                }
                            }
                        ],
                        "must": [
                            {
                                "bool": {
                                    "filter": [
                                        {
                                            "bool": {
                                                "filter": [
                                                    {
                                                        "bool": {
                                                            "filter": [
                                                                {
                                                                    "term": {
                                                                        "service.name": "opbeans-ruby"
                                                                    }
                                                                },
                                                                {
                                                                    "term": {
                                                                        "transaction.type": "request"
                                                                    }
                                                                },
                                                                {
                                                                    "term": {
                                                                        "transaction.name": "Rack"
                                                                    }
                                                                },
                                                                {
                                                                    "term": {
                                                                        "event.outcome": "failure"
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "filter": [
                                                                {
                                                                    "exists": {
                                                                        "field": "transaction.duration.histogram"
                                                                    }
                                                                }
                                                            ],
                                                            "must_not": [
                                                                {
                                                                    "terms": {
                                                                        "metricset.interval": [
                                                                            "10m", "60m"
                                                                        ]
                                                                    }
                                                                },
                                                                {
                                                                    "term": {
                                                                        "metricset.name": "service_transaction"
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "range": {
                                                "@timestamp": {
                                                    "gte": "now-1d",
                                                    "lte": "now"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "size": 0,
                "aggs": {
                    "duration_percentiles": {
                        "percentiles": {
                            "hdr": {
                                "number_of_significant_value_digits": 3
                            },
                            "field": "transaction.duration.histogram"
                        }
                    }
                }
            }
        });
        expect(response.status()).toBe(200);
    });
});

test('APM traces', async ({ request }) => {
    await test.step('query_01', async () => {
        let response = await request.post(`${process.env.ELASTICSEARCH_HOST}/${process.env.REMOTE_CCS_CLUSTER}:traces-apm*%2Capm-*/_search`, {
            data: {
                "track_total_hits": false,
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "terms": {
                                    "processor.event": [
                                        "transaction"
                                    ]
                                }
                            }
                        ],
                        "must": [
                            {
                                "bool": {
                                    "filter": [
                                        {
                                            "range": {
                                                "@timestamp": {
                                                    "gte": "now-1d",
                                                    "lte": "now"
                                                }
                                            }
                                        },
                                        {
                                            "bool": {
                                                "must_not": {
                                                    "exists": {
                                                        "field": "parent.id"
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "sample": {
                        "random_sampler": {
                            "probability": 1,
                            "seed": 1972544297
                        },
                        "aggs": {
                            "transaction_groups": {
                                "composite": {
                                    "sources": [
                                        {
                                            "service.name": {
                                                "terms": {
                                                    "field": "service.name"
                                                }
                                            }
                                        },
                                        {
                                            "transaction.name": {
                                                "terms": {
                                                    "field": "transaction.name"
                                                }
                                            }
                                        }
                                    ],
                                    "size": 10000
                                },
                                "aggs": {
                                    "transaction_type": {
                                        "top_metrics": {
                                            "sort": {
                                                "@timestamp": "desc"
                                            },
                                            "metrics": [
                                                {
                                                    "field": "transaction.type"
                                                },
                                                {
                                                    "field": "agent.name"
                                                }
                                            ]
                                        }
                                    },
                                    "avg": {
                                        "avg": {
                                            "field": "transaction.duration.us"
                                        }
                                    },
                                    "sum": {
                                        "sum": {
                                            "field": "transaction.duration.us"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        expect(response.status()).toBe(200);
    });

    await test.step('query_02', async () => {
        let response = await request.post(`${process.env.ELASTICSEARCH_HOST}/${process.env.REMOTE_CCS_CLUSTER}:traces-apm*%2Capm-*/_search`, {
            data: {
                "track_total_hits": false,
                "size": 0,
                "query":
                {
                    "bool":
                    {
                        "filter":
                            [
                                {
                                    "terms":
                                    {
                                        "processor.event": [
                                            "transaction"
                                        ]
                                    }
                                }
                            ],
                        "must":
                            [
                                {
                                    "bool": {
                                        "filter": [
                                            {
                                                "bool": {
                                                    "filter": [
                                                        {
                                                            "term":
                                                            {
                                                                "service.name": "opbeans-go"
                                                            }
                                                        },
                                                        {
                                                            "term":
                                                            {
                                                                "transaction.type": "request"
                                                            }
                                                        },
                                                        {
                                                            "term":
                                                            {
                                                                "transaction.name": "GET /api/orders"
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                "range":
                                                {
                                                    "@timestamp": {
                                                        "gte": "now-1d",
                                                        "lte": "now"
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                    }
                },
                "aggs":
                {
                    "attribute_terms":
                    {
                        "terms":
                        {
                            "field": "transaction.result", "size": 20
                        }
                    }
                }
            }
        });
        expect(response.status()).toBe(200);
    });

    await test.step('query_03', async () => {
        let response = await request.post(`${process.env.ELASTICSEARCH_HOST}/${process.env.REMOTE_CCS_CLUSTER}:traces-apm*%2Capm-*/_search`, {
            data: {
                "track_total_hits": false,
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "terms": {
                                    "processor.event": [
                                        "transaction"
                                    ]
                                }
                            }
                        ],
                        "must": [
                            {
                                "bool": {
                                    "filter": [
                                        {
                                            "term": {
                                                "transaction.sampled": true
                                            }
                                        },
                                        {
                                            "range": {
                                                "@timestamp": {
                                                    "gte": "now-1d",
                                                    "lte": "now"
                                                }
                                            }
                                        }
                                    ],
                                    "must_not": [
                                        {
                                            "exists": {
                                                "field": "parent.id"
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "transactionId": {
                        "terms": {
                            "field": "transaction.id",
                            "size": 500
                        },
                        "aggs": {
                            "latest": {
                                "top_metrics": {
                                    "metrics": [
                                        {
                                            "field": "trace.id"
                                        }
                                    ],
                                    "size": 1,
                                    "sort": {
                                        "@timestamp": "desc"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        expect(response.status()).toBe(200);
    });
});