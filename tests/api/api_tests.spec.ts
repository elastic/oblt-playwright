import {test, expect} from '@playwright/test';

test.describe('Fleet', () => {
    test('Create a new policy in Fleet', async({request}) => {  
        var counter = 0;
        do {
            var policyName = "Playwright Test Policy " + counter++;
            console.log(policyName + " already exists.");
            var response = await request.post('/api/fleet/agent_policies', {
                data: {
                    "name":policyName,
                    "namespace":"default",
                    "monitoring_enabled":["logs","metrics"],
                }
            })
        } while (response.status() === 409)

        expect(response.status()).toBe(200);
        const name = await response.text();
        expect(name).toContain(policyName);
        console.log(await response.json());
    });
});