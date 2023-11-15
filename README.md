## Setup 
Create .env file in the root directory with the following environmental variables:

```
ELASTIC_URL = 
ELASTIC_USERNAME = 
ELASTIC_PASSWORD = 
DATE_PICKER = 'Last 24 hours'
```

Commonly used date picker options:

- Last 15 minutes
- Last 30 minutes
- Last 1 hour
- Last 24 hours
- Last 7 days
- Last 30 days
- Last 90 days
- Last 1 year

## Preconditions
Install Playwright https://playwright.dev/docs/intro

Elastic deployment/project has APM and Kubernetes datasets.
Tests should be run during ongoing data collection.

## Running tests
To run all tests, specify project name (ess or serverless) in the following command:

```
npx playwright test --project ess --headed
```

To run a specific test, specify its name in the command. Example:

```
npx playwright test k8s_aggregations.ess.spec.ts --project ess --headed
```

## Test report

```
npx playwright show-report
```