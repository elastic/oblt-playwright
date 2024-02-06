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

Elastic deployment/project has [required datasets](https://github.com/elastic/oblt-playwright/blob/main/docs/data_mapping.md).
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

## Get Elasticsearch-friendly JSON test report 

Playwright spits out JSON test reports that have nested structure, which not quite suitable for Elasticsearch - results for each test is a separate array with its own fields. The problem is nested field type is not supported in Kibana visualizations. To solve this, use [this script](https://github.com/elastic/oblt-playwright/blob/main/tools/split_report.ts) to flatten and split a report by each test:

```
node tools\split_report.ts
```
<details>
<summary>Here is an example of how the outcome of that script might look like</summary>

```
{
  "title": "Infrastructure - Cluster Overview dashboard",
  "startTime": "2024-02-02T12:50:18.767Z",
  "status": "passed",
  "duration": 59414,
  "step01": 4351,
  "step02": 1064,
  "step03": 24160,
  "workerIndex": 1,
  "retry": 0,
  "errors": [],
  "timeout": 300000
}
```
</details>

Resulting files stored in the same directory as the original report.