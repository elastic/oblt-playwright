import { test, expect, APIRequestContext } from '@playwright/test';

const services = [
    'opbeans-go',
    'opbeans-dotnet',
    'opbeans-ruby',
    'opbeans-php',
    'opbeans-node',
    'opbeans-python',
    'opbeans-java',
    'web-go',
    'synth-service-0',
    'synth-service-1',
    'synth-service-2',
    'synth-node-0',
    'synth-node-1',
    'synth-node-2'
];

const pods = [
    'opbeans-python-db-0',
    'opbeans-go-nsn-db-0',
    'opbeans-java-db-0',
    'opbeans-go-db-0',
    'opbeans-node-db-0',
    'opbeans-php-db-0',
    'opbeans-ruby-db-0'
];

async function createRule(request: APIRequestContext, ruleName: string, ruleData: object) {
    const response = await request.post('/api/alerting/rule', {
        data: ruleData
    });
    expect(response.status()).toBe(200);
    const name = await response.text();
    expect(name).toContain(ruleName);
    if (response.ok()) {
        console.log('Alerting rule', ruleName, 'has been created.');
    }
}

function apmRulePayload(name: string, ruleTypeId: string, params: object): object {
    return {
        name,
        rule_type_id: ruleTypeId,
        consumer: 'alerts',
        schedule: { interval: '1m' },
        params: {
            windowSize: 5,
            windowUnit: 'm',
            environment: 'ENVIRONMENT_ALL',
            ...params
        }
    };
}

function inventoryAlertPayload(name: string, nodeType: string, criteria: object[]): object {
    return {
        name,
        rule_type_id: 'metrics.alert.inventory.threshold',
        consumer: 'alerts',
        schedule: { interval: '1m' },
        params: {
            nodeType,
            criteria,
            sourceId: 'default'
        }
    };
}

function esQueryRulePayload(name: string, consumer: string, params: object): object {
    const sourceFields = [
        { label: 'container.id', searchPath: 'container.id' },
        { label: 'host.hostname', searchPath: 'host.hostname' },
        { label: 'host.id', searchPath: 'host.id' },
        { label: 'host.name', searchPath: 'host.name' },
        { label: 'kubernetes.pod.uid', searchPath: 'kubernetes.pod.uid' }
    ];

    const baseParams = {
        searchType: 'searchSource',
        timeField: '@timestamp',
        timeWindowSize: 5,
        timeWindowUnit: 'm',
        size: 10,
        groupBy: 'all',
        termSize: 5,
        excludeHitsFromPreviousRun: false,
        sourceFields: sourceFields
    };

    return {
        name,
        consumer,
        rule_type_id: '.es-query',
        schedule: { interval: '1m' },
        params: { ...baseParams, ...params }
    };
}

test.describe.serial('Create alerting rules', () => {
    test('Error Count Threshold', async ({ request }) => {
        for (const svc of services) {
            const ruleName = `[Playwright Test] apm.error_rate - ${svc}`;
            const ruleData = apmRulePayload(ruleName, 'apm.error_rate', {
                serviceName: svc,
                threshold: 1200
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Failed Transaction Rate Threshold', async ({ request }) => {
        for (const svc of services) {
            const ruleName = `[Playwright Test] apm.transaction_error_rate - ${svc}`;
            const ruleData = apmRulePayload(ruleName, 'apm.transaction_error_rate', {
                serviceName: svc,
                threshold: 95
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('APM Anomaly', async ({ request }) => {
        for (const svc of services) {
            const ruleName = `[Playwright Test] apm.anomaly - ${svc}`;
            const ruleData = apmRulePayload(ruleName, 'apm.anomaly', {
                serviceName: svc,
                anomalyDetectorTypes: ['txLatency'],
                anomalySeverityType: 'critical'
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Latency Threshold', async ({ request }) => {
        const ruleName = "[Playwright Test] apm.transaction_duration";
        const ruleData = apmRulePayload(ruleName, 'apm.transaction_duration', {
            aggregationType: "avg",
            threshold: 1100
        });
        await createRule(request, ruleName, ruleData);
    });

    test('Hosts - Memory Threshold', async ({ request }) => {
        const ruleName = "[Playwright Test] host.memory.threshold";
        const ruleData = inventoryAlertPayload(ruleName, 'host', [{
            metric: 'memory',
            comparator: '>',
            threshold: [10],
            timeSize: 1,
            timeUnit: 'm',
            customMetric: {
                type: 'custom',
                id: 'alert-custom-metric',
                aggregation: 'avg',
                field: ''
            }
        }]);
        await createRule(request, ruleName, ruleData);
    });

    test('Hosts - CPU Threshold', async ({ request }) => {
        const ruleName = "[Playwright Test] host.cpu.threshold";
        const ruleData = inventoryAlertPayload(ruleName, 'host', [{
            metric: 'cpu',
            comparator: '>',
            threshold: [3],
            timeSize: 1,
            timeUnit: 'm',
            customMetric: {
                type: 'custom',
                id: 'alert-custom-metric',
                aggregation: 'avg',
                field: ''
            }
        }]);
        await createRule(request, ruleName, ruleData);
    });

    test('Kubernetes Pods - Memory Threshold', async ({ request }) => {
        const ruleName = "[Playwright Test] pod.memory.threshold";
        const ruleData = inventoryAlertPayload(ruleName, 'pod', [{
            metric: 'memory',
            comparator: '>',
            threshold: [12],
            timeSize: 1,
            timeUnit: 'm',
            customMetric: {
                type: 'custom',
                id: 'alert-custom-metric',
                aggregation: 'avg',
                field: ''
            }
        }]);
        await createRule(request, ruleName, ruleData);
    });

    test('Kubernetes Pods - Outbound Traffic Threshold', async ({ request }) => {
        const ruleName = "[Playwright Test] pod.outbound_traffic.threshold";
        const ruleData = inventoryAlertPayload(ruleName, 'pod', [{
            metric: 'tx',
            comparator: '>',
            threshold: [35000],
            timeSize: 1,
            timeUnit: 'm',
            customMetric: {
                type: 'custom',
                id: 'alert-custom-metric',
                aggregation: 'avg',
                field: ''
            }
        }]);
        await createRule(request, ruleName, ruleData);
    });

    test('Elasticsearch Query - Error Count Threshold', async ({ request }) => {
        for (const svc of services) {
            const ruleName = `[Playwright Test] .es-query - Error Count Threshold of ${svc}`;
            const ruleData = esQueryRulePayload(ruleName, 'alerts', {
                aggType: 'count',
                threshold: [1000],
                thresholdComparator: '>',
                searchConfiguration: {
                    query: { query: `service.name.keyword : "${svc}"`, language: 'kuery' },
                    index: 'logs-*',
                    filter: [
                        {
                            meta: {
                                disabled: false,
                                negate: false,
                                alias: null,
                                index: 'logs-*',
                                key: 'log.level',
                                field: 'log.level',
                                params: { query: 'error' },
                                type: 'phrase'
                            },
                            query: { match_phrase: { 'log.level': 'error' } },
                            $state: { store: 'appState' }
                        }
                    ]
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Elasticsearch Query - Service Logs Count', async ({ request }) => {
        for (const svc of services) {
            const ruleName = `[Playwright Test] .es-query - Logs Count of ${svc}`;
            const ruleData = esQueryRulePayload(ruleName, 'logs', {
                aggType: 'count',
                threshold: [500],
                thresholdComparator: '<',
                searchConfiguration: {
                    query: { query: `service.name.keyword : "${svc}"`, language: 'kuery' },
                    index: 'logs-*'
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Elasticsearch Query - Pod CPU Usage', async ({ request }) => {
        for (const p of pods) {
            const ruleName = `[Playwright Test] .es-query - Pod CPU Usage of ${p}`;
            const ruleData = esQueryRulePayload(ruleName, 'logs', {
                aggType: 'avg',
                aggField: 'kubernetes.pod.cpu.usage.node.pct',
                threshold: [80],
                thresholdComparator: '>',
                searchConfiguration: {
                    query: { query: `kubernetes.pod.name : ${p}`, language: 'kuery' },
                    index: 'metrics-*'
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Elasticsearch Query - Pod Memory Usage', async ({ request }) => {
        for (const p of pods) {
            const ruleName = `[Playwright Test] .es-query - Pod Memory Usage of ${p}`;
            const ruleData = esQueryRulePayload(ruleName, 'logs', {
                aggType: 'avg',
                aggField: 'kubernetes.pod.memory.usage.node.pct',
                threshold: [99.9],
                thresholdComparator: '>',
                searchConfiguration: {
                    query: { query: `kubernetes.pod.name : ${p}`, language: 'kuery' },
                    index: 'metrics-*'
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Elasticsearch Query - Pod Network Inbound', async ({ request }) => {
        for (const p of pods) {
            const ruleName = `[Playwright Test] .es-query - Network Inbound of ${p}`;
            const ruleData = esQueryRulePayload(ruleName, 'logs', {
                aggType: 'avg',
                aggField: 'kubernetes.pod.network.rx.bytes',
                threshold: [3000000],
                thresholdComparator: '<',
                searchConfiguration: {
                    query: { query: `kubernetes.pod.name : ${p}`, language: 'kuery' },
                    index: 'metrics-*'
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Elasticsearch Query - Pod Network Outbound', async ({ request }) => {
        for (const p of pods) {
            const ruleName = `[Playwright Test] .es-query - Network Outbound of ${p}`;
            const ruleData = esQueryRulePayload(ruleName, 'logs', {
                aggType: 'avg',
                aggField: 'kubernetes.pod.network.tx.bytes',
                threshold: [3000000],
                thresholdComparator: '<',
                searchConfiguration: {
                    query: { query: `kubernetes.pod.name : ${p}`, language: 'kuery' },
                    index: 'metrics-*'
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Elasticsearch Query - Container CPU Usage', async ({ request }) => {
        for (const p of pods) {
            const ruleName = `[Playwright Test] .es-query - Container CPU Usage of ${p}`;
            const ruleData = esQueryRulePayload(ruleName, 'logs', {
                aggType: 'avg',
                aggField: 'kubernetes.container.cpu.usage.node.pct',
                threshold: [0.2],
                thresholdComparator: '>',
                searchConfiguration: {
                    query: { query: `kubernetes.pod.name : ${p}`, language: 'kuery' },
                    index: 'metrics-*'
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Elasticsearch Query - Container CPU Usage Limit', async ({ request }) => {
        for (const p of pods) {
            const ruleName = `[Playwright Test] .es-query - Container CPU Usage Limit of ${p}`;
            const ruleData = esQueryRulePayload(ruleName, 'logs', {
                aggType: 'avg',
                aggField: 'kubernetes.container.cpu.usage.limit.pct',
                threshold: [0.5],
                thresholdComparator: '>',
                searchConfiguration: {
                    query: { query: `kubernetes.pod.name : ${p}`, language: 'kuery' },
                    index: 'metrics-*'
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Elasticsearch Query - Container Memory Usage', async ({ request }) => {
        for (const p of pods) {
            const ruleName = `[Playwright Test] .es-query - Container Memory Usage of ${p}`;
            const ruleData = esQueryRulePayload(ruleName, 'logs', {
                aggType: 'avg',
                aggField: 'kubernetes.container.memory.usage.bytes',
                threshold: [90000000],
                thresholdComparator: '>',
                searchConfiguration: {
                    query: { query: `kubernetes.pod.name : ${p}`, language: 'kuery' },
                    index: 'metrics-*'
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });

    test('Elasticsearch Query - Container Memory Usage Limit', async ({ request }) => {
        for (const p of pods) {
            const ruleName = `[Playwright Test] .es-query - Container Memory Usage Limit of ${p}`;
            const ruleData = esQueryRulePayload(ruleName, 'logs', {
                aggType: 'avg',
                aggField: 'kubernetes.container.memory.usage.limit.pct',
                threshold: [0.5],
                thresholdComparator: '>',
                searchConfiguration: {
                    query: { query: `kubernetes.pod.name : ${p}`, language: 'kuery' },
                    index: 'metrics-*'
                }
            });
            await createRule(request, ruleName, ruleData);
        }
    });
});