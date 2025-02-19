## How to run cross-cluster search tests

[A cross-cluster search test](https://github.com/elastic/oblt-playwright/blob/main/tests/api/apm_ccs.api.spec.ts) is designed to be run in CI on schedule. A schedule needs to be set in a [GitHub Actions workflow](https://github.com/elastic/oblt-playwright/blob/main/.github/workflows/stateful_ccs.yml#L4).

### Prerequisites:

#### Variables
```
# The number of remote clusters
REMOTE_CLUSTERS = 1

# Remote clusters aliases (not to be confused with ES endpoints)
REMOTE_CCS_CLUSTER_01 = 
REMOTE_CCS_CLUSTER_02 = 
REMOTE_CCS_CLUSTER_03 = 
REMOTE_CCS_CLUSTER_04 =

# A range of historical data to run tests against
RANGE = now-1d

# The reporting cluster index
REPORTING_CLUSTER_INDEX =

# A path to report file
REPORT_FILE = /home/runner/work/oblt-playwright/test-results/results.json
```

#### Secrets
```
# The overview cluster ES endpoint
ELASTICSEARCH_HOST_DEPLOYMENT_B =

# The overview cluster API key
API_KEY_DEPLOYMENT_B = 'ApiKey ...'

# The reporting cluster ES endpoint
REPORTING_CLUSTER_ES =

# The reporting cluster API key
REPORTING_CLUSTER_API_KEY = 'ApiKey ...'
```

