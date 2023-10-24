## Setup 
Edit .env with ELASTIC_URL, ELASTIC_USERNAME, ELASTIC_PASSWORD.

## Running tests
To run tests, specify test name (test_name.spec.ts) and project (ess or serverless) in the following command:

```
npx playwright test apm.spec.ts --project ess --headed
```

## Report

```
npx playwright show-report
```