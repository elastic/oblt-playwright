// Script to create x number of synthetics monitors.

// Fill out KIBANA_HOST & API_KEY env variables.

// Run the script:
// npx playwright test synth_monitors.api.spec.ts --project api --reporter line

import {test, expect} from '@playwright/test';

// test('HTTP Ping', async({request}) => {
//     for (let i = 0; i < 25; i++) {
//         const ruleName = Math.random().toString(36).slice(2, 8);
//         const url = "https://www.elastic.co/";
//         const frequency = "10";
//         let response = await request.post('/api/synthetics/monitors', {
//             data: {
//                     "type": "http",
//                     "form_monitor_type": "http",
//                     "enabled": true,
//                     "alert": {
//                         "status": {
//                             "enabled": true
//                         },
//                         "tls": {
//                             "enabled": true
//                         }
//                     },
//                     "schedule": {
//                         "number": frequency,
//                         "unit": "m"
//                     },
//                     "service.name": "",
//                     "config_id": "",
//                     "tags": [],
//                     "timeout": "16",
//                     "name": ruleName,
//                     "locations": [
//                         {
//                             "id": "europe-west3-a",
//                             "label": "Europe - Germany",
//                             "isServiceManaged": true
//                         }
//                     ],
//                     "namespace": "default",
//                     "origin": "ui",
//                     "journey_id": "",
//                     "hash": "",
//                     "id": "",
//                     "params": "",
//                     "max_attempts": 2,
//                     "revision": 1,
//                     "__ui": {
//                         "is_tls_enabled": false
//                     },
//                     "urls": url,
//                     "max_redirects": "0",
//                     "url.port": null,
//                     "password": "",
//                     "proxy_url": "",
//                     "proxy_headers": {},
//                     "check.response.body.negative": [],
//                     "check.response.body.positive": [],
//                     "check.response.json": [],
//                     "response.include_body": "on_error",
//                     "check.response.headers": {},
//                     "response.include_headers": true,
//                     "check.response.status": [],
//                     "check.request.body": {
//                         "type": "text",
//                         "value": ""
//                     },
//                     "check.request.headers": {},
//                     "check.request.method": "GET",
//                     "username": "",
//                     "mode": "any",
//                     "response.include_body_max_bytes": "1024",
//                     "ipv4": true,
//                     "ipv6": true,
//                     "ssl.certificate_authorities": "",
//                     "ssl.certificate": "",
//                     "ssl.key": "",
//                     "ssl.key_passphrase": "",
//                     "ssl.verification_mode": "full",
//                     "ssl.supported_protocols": [
//                         "TLSv1.1",
//                         "TLSv1.2",
//                         "TLSv1.3"
//                     ]
//             }
//         })
//         expect(response.status()).toBe(200);
//         const name = await response.text();
//         expect(name).toContain(ruleName);
//     }
// })

test('Single page', async({request}) => {
    for (let i = 0; i < 12; i++) {
        const ruleName = Math.random().toString(36).slice(2, 8);
        const url = "https://www.elastic.co";
        const frequency = "3";
        let response = await request.post('/api/synthetics/monitors', {
            data: {
                "type": "browser",
                "form_monitor_type": "single",
                "enabled": true,
                "alert": {
                    "status": {
                        "enabled": true
                    },
                    "tls": {
                        "enabled": true
                    }
                },
                "schedule": {
                    "unit": "m",
                    "number": frequency
                },
                "service.name": "",
                "config_id": "",
                "tags": [],
                "timeout": null,
                "name": ruleName,
                "locations": [
                    {
                        "id": "us-west1-a",
                        "label": "North America - US West",
                        "isServiceManaged": true
                    }
                ],
                "namespace": "default",
                "origin": "ui",
                "journey_id": "",
                "hash": "",
                "id": "",
                "params": "",
                "max_attempts": 2,
                "revision": 1,
                "project_id": "",
                "playwright_options": "",
                "__ui": {
                    "script_source": {
                        "is_generated_script": false,
                        "file_name": ""
                    }
                },
                "url.port": null,
                "source.inline.script": `step('Go to ${url}', async () => {\n          await page.goto('${url}');\n        });`,
                "source.project.content": "",
                "playwright_text_assertion": "",
                "urls": url,
                "screenshots": "on",
                "synthetics_args": [],
                "filter_journeys.match": "",
                "filter_journeys.tags": [],
                "ignore_https_errors": false,
                "throttling": {
                    "value": {
                        "download": "5",
                        "upload": "3",
                        "latency": "20"
                    },
                    "id": "default",
                    "label": "Default"
                },
                "ssl.certificate_authorities": "",
                "ssl.certificate": "",
                "ssl.key": "",
                "ssl.key_passphrase": "",
                "ssl.verification_mode": "full",
                "ssl.supported_protocols": [
                    "TLSv1.1",
                    "TLSv1.2",
                    "TLSv1.3"
                ]
            }
        })
        expect(response.status()).toBe(200);
        const name = await response.text();
        expect(name).toContain(ruleName);
    }
})