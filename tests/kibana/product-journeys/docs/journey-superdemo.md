[🔗 Test code](https://github.com/elastic/oblt-playwright/blob/main/tests/kibana/product-journeys/superdemo.journey.spec.ts)
---
| **Test**  | **Steps** |
| :------------ | :------------ |
| **Agent Builder** | **Step 01** - Navigate to Agents, open Manage agents, create an agent, filter the list by display name, and assert the agent is listed<br><br>**Step 02** - Open the agent, switch to the "Chat" tab, send the prompt, and assert the response completed<br><br>**Step 03** - Switch to the "Overview" tab, update the custom instructions, and assert the "Agent details updated" toast is visible<br><br>**Step 04** - Open Manage agents, filter the list by display name, delete the agent, and assert the agent is no longer listed<br><br> |
| **PromQL** | **Step 01** - Navigate to Discover, switch to ES\|QL mode, run `PROMQL index=metrics-* start=?_tstart end=?_tend step=5m sum by (region) (rate(metrics.http_requests_total[5m]))`, and assert the data grid shows `trading-na` and `trading-emea` and the canvas is loaded<br><br> |
