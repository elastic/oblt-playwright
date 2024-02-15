## Serverless

| Scenario  | Required data |
| :------------ | :------------ |
| [apm.serverless.spec](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/apm.serverless.spec.ts)<br><br>**Services**, **Traces** and **Dependencies** sections walkthroughs. | APM traces;<br>Host logs;<br>Trace logs.  |
| [infra.serverless.spec](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/infra.serverless.spec.ts)<br><br>**[Metrics Kubernetes] Cluster Overview** dashboard,<br>**Inventory**, **Hosts** sections walkthroughs.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy.  |
| [k8s_aggs.serverless.spec](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/k8s_aggs.serverless.spec.ts)<br><br>Validating query/request time in custom visualizations aggregating k8s metrics.  | Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy. |
| [logs.serverless.spec](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/logs.serverless.spec.ts)<br><br>Operating with Nginx access logs in **Logs Explorer**.  | Nginx access logs.  |
| [alerting_rules.api.spec.ts](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/api/alerting_rules.api.spec.ts)<br><br>Creating a bunch of alerting rules to evaluate the impact of rules execution on performance.  | APM traces;<br><br>Kubernetes metrics from:<br>- Kubelet API,<br>- kube-state-metrics,<br>- Kubernetes API Server,<br>- Kubernetes Proxy. 