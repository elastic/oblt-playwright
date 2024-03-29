# UI walkthroughs
## Serverless

| Scenario  | Required data |
| :------------ | :------------ |
| [apm.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/apm.serverless.spec.ts)<br><br>Services, Traces and Dependencies sections walkthroughs. Tracking the duration it takes for page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume. | APM traces;<br>Host logs;<br>Trace logs.  |
| [infra.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/infra.serverless.spec.ts)<br><br>Capturing Kubernetes metrics visualizations' request/query time in "Cluster Overview" dashboard. Tracking the duration it takes for Inventory/Hosts page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy.  |
| [k8s_aggs.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/k8s_aggs.serverless.spec.ts)<br><br>Capturing query/request time in custom visualizations aggregating k8s metrics.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy. |
| [logs.serverless.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/logs.serverless.spec.ts)<br><br>Operating with Nginx access logs in Logs Explorer. Tracking the duration it takes for page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Nginx access logs.  |

## Stateful

| Scenario  | Required data |
| :------------ | :------------ |
| [apm.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/apm.stateful.spec.ts)<br><br>Services, Traces and Dependencies sections walkthroughs. Tracking the duration it takes for page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume. | APM traces;<br>Host logs;<br>Trace logs.  |
| [infra.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/infra.stateful.spec.ts)<br><br>Capturing Kubernetes metrics visualizations' request/query time in "Cluster Overview" dashboard. Tracking the duration it takes for Inventory/Hosts page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy.  |
| [k8s_aggs.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/k8s_aggs.stateful.spec.ts)<br><br>Capturing query/request time in custom visualizations aggregating k8s metrics.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy.  |
| [logs.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/logs.stateful.spec.ts)<br><br>Operating with Nginx access logs in Logs Explorer. Tracking the duration it takes for page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Nginx access logs.  |
| [logs.datasets.stateful.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/stateful/logs.datasets.stateful.spec.ts)<br><br>Assessing Datasets page loading time.  | Any kind of log data.  |

# API tests

| Scenario  | Required data |
| :------------ | :------------ |
| [alerting_rules.api.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/api/alerting_rules.api.spec.ts)<br><br>Creating a bunch of alerting rules to evaluate the impact of rules execution on performance.  | APM traces;<br><br>Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy.