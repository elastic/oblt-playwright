## Setup 
Create .env file in the root directory with the following environmental variables:

```
ELASTIC_URL = 
ELASTIC_USERNAME = 
ELASTIC_PASSWORD = 
```

## Preconditions
Elastic deployment/project has APM and Kubernetes datasets.
Tests should be run during ongoing data collection.

## Running tests
To run tests, specify project name (ess or serverless) in the following command:

```
npx playwright test --project ess --headed
```

## Test report

```
npx playwright show-report
```