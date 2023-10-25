## Setup 
Edit .env with ELASTIC_URL, ELASTIC_USERNAME, ELASTIC_PASSWORD.

## Running tests
To run tests, specify project name (ess or serverless) in the following command:

```
npx playwright test --project ess --headed
```

## Test report

```
npx playwright show-report
```