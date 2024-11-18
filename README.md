# oblt-playwright

Emulating end-user experience in different areas of Observability on clusters which are placed under significant load and evaluating whole-stack performance between different types of deployments. Most tests are designed to put together as many "heavy" areas (such as pages with multiple visualizations) as possible and navigate the user through several pages of a particular Kibana section, measuring the scenario duration.

## Getting Started
Install [Playwright](https://playwright.dev/docs/intro).

Examine available [test scenarios and required datasets](https://github.com/elastic/oblt-playwright/blob/main/docs/data_mapping.md).
Have ideas for new user journeys? Check [the guide for creating a new test](https://github.com/elastic/oblt-playwright/blob/main/docs/guidelines.md).

## Setup

Create .env file in the root directory with the following environmental variables:

```
# Only if you are running tests against
# your local Kibana and ES
# CLUSTER_ENVIRONMENT = local
KIBANA_HOST =
ELASTICSEARCH_HOST =
KIBANA_USERNAME =
KIBANA_PASSWORD =
TIME_UNIT = 'Minutes'
TIME_VALUE = 15
API_KEY = 'ApiKey ...'
REPORT_FILE = ../test-results/results.json
```

Use `DOTENV_PATH` environment variable when running Playwright to switch between alternative configurations when needed, for example `DOTENV_PATH=./.env.serverless npx playwright test …`

#### Verbose logging

To enable verbose logging, set the `DEBUG` environmental variable:
```
DEBUG = "pw:api"
```

### Create alerting rules

In case there is a need to assess the impact of alerting rules execution on performance, it is recommended to create alerting rules before generating any data by running the following command:

```
npx playwright test alerting_rules.api.spec.ts --project api
```

Note: API key is required.

## Running tests

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

## Get Elasticsearch-friendly JSON test report

Playwright spits out JSON test reports that have nested structure, which not quite suitable for Elasticsearch - results for each test is a separate array with its own fields. The problem is nested field type is not supported in Kibana visualizations. To solve this, use [this script](https://github.com/elastic/oblt-playwright/blob/main/utils/split_json_report.ts) to flatten and split a report by each test:

```
node utils\split_json_report.ts
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
