import {test, expect} from '@playwright/test';

test.describe.serial('Fleet', () => {
    test('Policy actions', async({request}) => {  
        const policy = await test.step('Create a new policy', async () => { 
            var counter = 1;
            do {
                var policyName = "Playwright Test Policy " + counter++;
                console.log(policyName + " exists.");
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
            const responseBody = JSON.parse(await response.text());
            console.log("Policy has been created.");
            return responseBody;
    });

        const integration = await test.step('Add nginx integration', async() => {  
            var response = await request.post('/api/fleet/package_policies', {
                data: {
                    "name":"nginx-playwright-test",
                    "namespace":"default",
                    "enabled":"true",
                    "policy_id": policy.item.id,
                    "package":{"name":"nginx", "title":"Nginx", "version":"1.17.0"},
                    "inputs":[],
                }
            })

            expect(response.status()).toBe(200);
            const name = await response.text();
            expect(name).toContain("nginx-playwright-test");
            const responseBody = JSON.parse(await response.text());
            console.log("Integration has been added.");
            return responseBody;
        });

});
});