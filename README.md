## Setup 
Create .env file in the root directory with the following environmental variables:

```
// Required
ELASTIC_URL = 
ELASTIC_USERNAME = 
ELASTIC_PASSWORD = 
DATE_PICKER = 'Last 24 hours'

// Optional
API_KEY = 
REPORT_FILE = ../test-results/results.json
```

Commonly used date picker options:

- Last 15 minutes
- Last 30 minutes
- Last 1 hour
- Last 24 hours
- Last 7 days
- Last 30 days

## Preconditions
Install Playwright https://playwright.dev/docs/intro

Elastic deployment/project has APM and Kubernetes datasets.
Tests should be run during ongoing data collection.

## Running tests
To run all tests, specify project name (`stateful` or `serverless`) in the following command:

```
npx playwright test --project stateful --headed
```

To run a specific test, specify its name in the command. Example:

```
npx playwright test k8s_aggs.ess.spec.ts --project stateful --headed
```

### API testing
To authorize access to Elasticsearch resources, pass your API key into `API_KEY` environmental variable. To run a suite of API tests, specify correspondent project name (`api`) in the following command:

```
npx playwright test --project api
```

## Test report (HTML)

```
npx playwright show-report
```

## Flattening JSON report

To split JSON report into multiple files (each representing a single test):

```
node tools\split_report.ts
```

Resulting files stored in the same directory as the original report.