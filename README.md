# oblt-playwright

A test framework for assessing the search performance of Elastic Observability solution across various deployment types from the end-user perspective, supporting the last released version.

## Getting Started

### Prerequisites

Test scenarios require a deployment/project to ingest scenario-specific data, examine [required datasets](https://github.com/elastic/oblt-playwright/blob/main/docs/data_mapping.md) accordingly.

Note: APM scenarios are strictly bound to data generated by [apmsoak](https://github.com/elastic/apm-perf/tree/main/cmd/apmsoak).

### Installation

Make sure you have [Node.js](https://nodejs.org/en/download) installed.

1. Clone the repository.
```
git clone https://github.com/elastic/oblt-playwright.git
```
2. Install dependencies:
```
npm install
```
3. Install Chromium:
```
npx playwright install chromium
```

### Setup 

Create .env file in the root directory with the following environmental variables:

```
KIBANA_HOST = 
ELASTICSEARCH_HOST =
KIBANA_USERNAME = 
KIBANA_PASSWORD = 
TIME_UNIT = 'Minutes'
TIME_VALUE = 15
API_KEY = 'ApiKey ...'
```

### Create alerting rules

In case there is a need to assess the impact of alerting rules execution on performance, it is recommended to create alerting rules before generating any data by running the following command: 

```
npx playwright test alerting_rules.api.spec.ts --project api
```

Note: API key is required.

## Running tests

Examine available [test scenarios and required datasets](https://github.com/elastic/oblt-playwright/blob/main/docs/data_mapping.md).
Have ideas for new user journeys? Check [the guide for creating a new test](https://github.com/elastic/oblt-playwright/blob/main/docs/guidelines.md).

By default, tests run in headless mode. To launch browsers in headed mode, use the `--headed` flag.
It is recommended to run tests during ongoing data collection.


### Run a specific script

Specify script name and project name (`stateful` or `serverless`) in the test command. Example:

```
npx playwright test apm.serverless.spec.ts --project serverless --headed
```

### Run a specific test

Specify test name and project name (`stateful` or `serverless`) in the test command. Example:

```
npx playwright test -g "Auto-detect logs and metrics" --project serverless --headed
```

### API testing

To authorize access to Elasticsearch resources, pass your API key into `API_KEY` environmental variable. To run a suite of API tests, specify correspondent project name (`api`) in the following command:

```
npx playwright test --project api
```