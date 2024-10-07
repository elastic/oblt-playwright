# UI walkthroughs
## Serverless

| Scenario  | Required data |
| :------------ | :------------ |
| [apm.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/apm.serverless.spec.ts)<br><br>Services, Traces and Dependencies sections walkthroughs. Tracking the duration it takes for page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume. | APM traces;<br>Host logs;<br>Trace logs.  |
| [hosts.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/hosts.serverless.spec.ts)<br><br>Measuring the loading time of elements within Hosts landing page and individual Hosts pages. Aggregates results in JSON report.  | Host logs and metrics; |
| [infra.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/infra.serverless.spec.ts)<br><br>Capturing Kubernetes metrics visualizations' request/query time in "Cluster Overview" dashboard. Tracking the duration it takes for Inventory/Hosts page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy.  |
| [k8s_aggs.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/k8s_aggs.serverless.spec.ts)<br><br>Capturing query/request time in custom visualizations aggregating k8s metrics.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy. |
| [logs.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/logs.serverless.spec.ts)<br><br>Operating with Nginx access logs in Logs Explorer. Tracking the duration it takes for page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Nginx access logs.  |
| [onboarding.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/onboarding.serverless.spec.ts)<br><br>Saves a bash script to auto-detect logs and metrics on a host. Validates data ingestion.<br><br>To run a test with a specific title, use the `-g` flag followed by the title of the test:<br>`npx playwright test onboarding.serverless.spec.ts -g "Kubernetes" --project serverless` | — |

## Stateful

| Scenario  | Required data |
| :------------ | :------------ |
| [apm.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/apm.stateful.spec.ts)<br><br>Services, Traces and Dependencies sections walkthroughs. Tracking the duration it takes for page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume. | APM traces;<br>Host logs;<br>Trace logs.  |
| [hosts.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/hosts.stateful.spec.ts)<br><br>Measuring the loading time of elements within Hosts landing page and individual Hosts pages. Aggregates results in JSON report.  | Host logs and metrics; |
| [infra.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/infra.stateful.spec.ts)<br><br>Capturing Kubernetes metrics visualizations' request/query time in "Cluster Overview" dashboard. Tracking the duration it takes for Inventory/Hosts page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy.  |
| [logs.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/logs.stateful.spec.ts)<br><br>Operating with Nginx access logs in Logs Explorer. Tracking the duration it takes for page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Nginx access logs.  |
| [logs.datasets.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/logs.datasets.stateful.spec.ts)<br><br>Assessing Datasets page loading time.  | Any kind of log data.  |
| [onboarding.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/onboarding.stateful.spec.ts)<br><br>Saves a bash script to auto-detect logs and metrics on a host. Validates data ingestion.<br><br>To run a test with a specific title, use the `-g` flag followed by the title of the test:<br>`npx playwright test onboarding.stateful.spec.ts -g "Kubernetes" --project stateful` | — |

# API tests

| Scenario  | Required data |
| :------------ | :------------ |
| [alerting_rules.api.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/api/alerting_rules.api.spec.ts)<br><br>Creating a bunch of alerting rules to evaluate the impact of rules execution on performance.  | APM traces;<br><br>Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy. |
| [slos.api.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/api/slos.api.spec.ts)<br><br>Creates SLOs, measures the time it takes for the source data to transform and get into ```.slo-observability.sli-v3``` / ```.slo-observability.summary-v3*``` indices. Also measures the time it takes for the rollup data to get into summary. Deletes SLO in the end.  | APM traces; |
| [synth_monitors.api.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/api/synth_monitors.api.spec.ts)<br><br>Creates x number of synthetics monitors. | — |
