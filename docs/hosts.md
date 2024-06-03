## How to run Hosts performance tests

Create .env file in the root directory with the following environmental variables:

```
KIBANA_HOST = 
KIBANA_USERNAME = 
KIBANA_PASSWORD = 
API_KEY = 'ApiKey ...'
TIME_UNIT = 'Minutes'
TIME_VALUE = 15
HOSTS_DIR = ../test-reports/hosts
```

### Running tests

#### Stateful:

```
npx playwright test hosts.stateful.spec.ts --project stateful --headed --reporter=line --workers 1
```

#### Serverless:

```
npx playwright test hosts.serverless.spec.ts --project serverless --headed --reporter=line --workers 1
```