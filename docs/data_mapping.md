# UI walkthroughs

| Scenario  | Required data |
| :------------ | :------------ |
| [apm.kibana.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/kibana/apm.kibana.spec.ts)<br><br>Services, Traces and Dependencies sections walkthroughs. Tracking the duration it takes for page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume. | APM traces;<br>Host logs;<br>Trace logs.  |
| [datasets.kibana.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/kibana/datasets.kibana.spec.ts)<br><br>Measuring the loading time of elements within "Data Set Quality" page.  | Log data.  |
| [hosts.kibana.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/kibana/hosts.kibana.spec.ts)<br><br>Measuring the loading time of elements within "Hosts" landing page. | Host logs and metrics. |
| [infra.kibana.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/kibana/infra.kibana.spec.ts)<br><br>Capturing Kubernetes metrics visualizations' request/query time in "Cluster Overview" dashboard. Tracking the duration it takes for "Inventory" page elements and visualizations to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy.  |
| [k8s_aggs.kibana.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/kibana/k8s_aggs.kibana.spec.ts)<br><br>Tracking the duration it takes for custom visualizations aggregating k8s metrics to render and appear on screen within the allocated timeframe, reflecting the anticipated test data volume.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy. |
| [logs.kibana.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/kibana/logs.kibana.spec.ts)<br><br>Tracking the duration it takes for logs in the Discover section to return within the allocated timeframe, reflecting the anticipated test data volume. Measuring the loading time of pattern analysis and field statistics.  | Log data.  |

# API tests

| Scenario  | Required data |
| :------------ | :------------ |
| [alerting_rules.api.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/api/alerting_rules.api.spec.ts)<br><br>Creating a bunch of alerting rules to evaluate the impact of rules execution on performance.  | APM traces;<br><br>Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy. |
| [slos.api.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/api/slos.api.spec.ts)<br><br>Creates SLOs, measures the time it takes for the source data to transform and get into ```.slo-observability.sli-v3``` / ```.slo-observability.summary-v3*``` indices. Also measures the time it takes for the rollup data to get into summary. Deletes SLO in the end.  | APM traces. |
| [synth_monitors.api.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/api/synth_monitors.api.spec.ts)<br><br>Creates x number of synthetics monitors. | — |
