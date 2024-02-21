import {test, expect} from '@playwright/test';

test.describe.serial('Create alerting rules', () => {
    test('Error count threshold.', async({request}) => { 
        const ruleName = "[Playwright Test] apm.error_rate";
        let response = await request.post('/api/alerting/rule', {
            data: {
                "params":{
                    "threshold":5000,
                    "windowSize":5,
                    "windowUnit":"m",
                    "environment":"ENVIRONMENT_ALL"
                },
                "consumer":"alerts",
                "schedule":{"interval":"1m"},
                "name":ruleName,
                "rule_type_id":"apm.error_rate"
            }
        })
        
        expect(response.status()).toBe(200);
        const name = await response.text();
        expect(name).toContain(ruleName);
        if (response.status() >= 200 && response.status() < 300) {
            console.log("Alerting rule", ruleName, "has been created.")
        }
    });

    test('Failed transaction rate threshold.', async({request}) => { 
        const ruleName = "[Playwright Test] apm.transaction_error_rate";
        let response = await request.post('/api/alerting/rule', {
            data: {
                "params":{
                    "threshold":25,
                    "windowSize":5,
                    "windowUnit":"m",
                    "environment":"ENVIRONMENT_ALL"
                },
                "consumer":"alerts",
                "schedule":{"interval":"1m"},
                "name":ruleName,
                "rule_type_id":"apm.transaction_error_rate"
            }
        })
        
        expect(response.status()).toBe(200);
        const name = await response.text();
        expect(name).toContain(ruleName);
        if (response.status() >= 200 && response.status() < 300) {
            console.log("Alerting rule", ruleName, "has been created.")
        }
    });

    test('Latency threshold.', async({request}) => { 
        const ruleName = "[Playwright Test] apm.transaction_duration";
        let response = await request.post('/api/alerting/rule', {
            data: {
                "params":{
                    "aggregationType":"avg",
                    "threshold":1100,
                    "windowSize":5,
                    "windowUnit":"m",
                    "environment":"ENVIRONMENT_ALL"
                },
                "consumer":"alerts",
                "schedule":{"interval":"1m"},
                "name":ruleName,
                "rule_type_id":"apm.transaction_duration"
            }
        })
        
        expect(response.status()).toBe(200);
        const name = await response.text();
        expect(name).toContain(ruleName);
        if (response.status() >= 200 && response.status() < 300) {
            console.log("Alerting rule", ruleName, "has been created.")
        }
    });

    test('Hosts - Memory threshold.', async({request}) => { 
        const ruleName = "[Playwright Test] host.memory.threshold";
        let response = await request.post('/api/alerting/rule', {
            data: {
                "params":{
                    "nodeType":"host",
                    "criteria":[
                        {
                            "metric":"memory",
                            "comparator":">",
                            "threshold":[10],
                            "timeSize":1,
                            "timeUnit":"m",
                            "customMetric":{
                                "type":"custom",
                                "id":"alert-custom-metric",
                                "aggregation":"avg",
                                "field":""
                            }
                        }
                    ],
                    "sourceId":"default"
                },
                "consumer":"alerts",
                "schedule":{"interval":"1m"},
                "name":ruleName,
                "rule_type_id":"metrics.alert.inventory.threshold"
            }
        })
        
        expect(response.status()).toBe(200);
        const name = await response.text();
        expect(name).toContain(ruleName);
        if (response.status() >= 200 && response.status() < 300) {
            console.log("Alerting rule", ruleName, "has been created.")
        }
    });

    test('Hosts - CPU threshold.', async({request}) => { 
        const ruleName = "[Playwright Test] host.cpu.threshold";
        let response = await request.post('/api/alerting/rule', {
            data: {
                "params":{
                    "nodeType":"host",
                    "criteria":[
                        {
                            "metric":"cpu",
                            "comparator":">",
                            "threshold":[3],
                            "timeSize":1,
                            "timeUnit":"m",
                            "customMetric":{
                                "type":"custom",
                                "id":"alert-custom-metric",
                                "aggregation":"avg",
                                "field":""
                            }
                        }
                    ],
                    "sourceId":"default"
                },
                "consumer":"alerts",
                "schedule":{"interval":"1m"},
                "name":ruleName,
                "rule_type_id":"metrics.alert.inventory.threshold"
            }
        })
        
        expect(response.status()).toBe(200);
        const name = await response.text();
        expect(name).toContain(ruleName);
        if (response.status() >= 200 && response.status() < 300) {
            console.log("Alerting rule", ruleName, "has been created.")
        }
    });

    test('Kubernetes Pods - Memory threshold.', async({request}) => { 
        const ruleName = "[Playwright Test] pod.memory.threshold";
        let response = await request.post('/api/alerting/rule', {
            data: {
                "params":{
                    "nodeType":"pod",
                    "criteria":[
                        {
                            "metric":"memory",
                            "comparator":">",
                            "threshold":[12],
                            "timeSize":1,
                            "timeUnit":"m",
                            "customMetric":{
                                "type":"custom",
                                "id":"alert-custom-metric",
                                "aggregation":"avg",
                                "field":""
                            }
                        }
                    ],
                    "sourceId":"default"
                },
                "consumer":"alerts",
                "schedule":{"interval":"1m"},
                "name":ruleName,
                "rule_type_id":"metrics.alert.inventory.threshold"
            }
        })
        
        expect(response.status()).toBe(200);
        const name = await response.text();
        expect(name).toContain(ruleName);
        if (response.status() >= 200 && response.status() < 300) {
            console.log("Alerting rule", ruleName, "has been created.")
        }
    });

    test('Kubernetes Pods - Outbound traffic threshold.', async({request}) => { 
        const ruleName = "[Playwright Test] pod.outbound_traffic.threshold";
        let response = await request.post('/api/alerting/rule', {
            data: {
                "params":{
                    "nodeType":"pod",
                    "criteria":[
                        {
                            "metric":"tx",
                            "comparator":">",
                            "threshold":[35000],
                            "timeSize":1,
                            "timeUnit":"m",
                            "customMetric":{
                                "type":"custom",
                                "id":"alert-custom-metric",
                                "aggregation":"avg",
                                "field":""
                            }
                        }
                    ],
                    "sourceId":"default"
                },
                "consumer":"alerts",
                "schedule":{"interval":"1m"},
                "name":ruleName,
                "rule_type_id":"metrics.alert.inventory.threshold"
            }
        })
        
        expect(response.status()).toBe(200);
        const name = await response.text();
        expect(name).toContain(ruleName);
        if (response.status() >= 200 && response.status() < 300) {
            console.log("Alerting rule", ruleName, "has been created.")
        }
    });
});