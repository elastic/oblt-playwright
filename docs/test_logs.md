[🔗 Test code](https://github.com/elastic/oblt-playwright/blob/main/tests/kibana/logs.kibana.spec.ts)
---
| **Test**  | **Steps** |
| :------------ | :------------ |
| **Discover - All logs** | **Step 01** - Select the `*logs` data view, set the search interval via the date picker, and assert the canvas is loaded<br><br>  |
| **Discover - Field Statistics** | **Step 01** - Select the `*logs` data view, set the search interval via the date picker and assert the canvas is loaded<br><br>_⌛Spend 30 seconds reviewing the page_<br><br>**Step 02** - Navigate to the "Field Statistics" tab, wait for the data to load and assert the doc count is visible<br><br>  |
| **Discover - Patterns** | **Step 01** - Select the `*logs` data view, set the search interval via the date picker and assert the canvas is visible<br><br>_⌛Spend 30 seconds reviewing the page_<br><br>**Step 02** - Navigate to the "Patterns" tab, wait for the data to load and assert the patterns row is visible  |
