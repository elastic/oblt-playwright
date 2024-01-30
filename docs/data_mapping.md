## Serverless

| Scenario  | Required data |
| :------------ | ------------: |
| [apm.serverless.spec](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/apm.serverless.spec.ts) | APM traces,<br>Host logs,<br>Trace logs  |
| [infra.serverless.spec](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/infra.serverless.spec.ts)  | Kubernetes metrics from:<br> Kubelet API,<br>kube-state-metrics,<br>Kubernetes API Server,<br>Kubernetes Proxy,<br>Kubernetes API Server  |
| [k8s_aggs.serverless.spec](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/k8s_aggs.serverless.spec.ts)  | Kubernetes metrics from:<br> Kubelet API,<br>kube-state-metrics,<br>Kubernetes API Server,<br>Kubernetes Proxy,<br>Kubernetes API Server  |
| [logs.serverless.spec](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/logs.serverless.spec.ts)  | Nginx access logs  |