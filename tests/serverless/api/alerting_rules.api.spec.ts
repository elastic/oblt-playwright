import {test, expect} from '@playwright/test';

test.describe.serial('Create alerting rules', () => {
    test('Error count threshold.', async({request}) => { 
        var ruleName = "[Playwright Test] apm.error_rate";
        var response = await request.post('/api/alerting/rule', {
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
        console.log("Alerting rule has been created.");
    });

    test('Failed transaction rate threshold.', async({request}) => { 
        var ruleName = "[Playwright Test] apm.transaction_error_rate";
        var response = await request.post('/api/alerting/rule', {
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
        console.log("Alerting rule has been created.");
    });

    test('Latency threshold.', async({request}) => { 
        var ruleName = "[Playwright Test] apm.transaction_duration";
        var response = await request.post('/api/alerting/rule', {
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
        console.log("Alerting rule has been created.");
    });

    test('Hosts - Memory threshold.', async({request}) => { 
        var ruleName = "[Playwright Test] metrics.alert.inventory.threshold";
        var response = await request.post('/api/alerting/rule', {
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
        console.log("Alerting rule has been created.");
    });

});