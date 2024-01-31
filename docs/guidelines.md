# Available methods

<details>
<summary>dashboardPage</summary>

## [dashboardPage](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/pages/dashboard.page.ts)

| Actions  |
| :------------ |
| `clickOptions()` |
| `clickTags()` |
| `closeFlyout()` |
| `filterByKubernetesTag()` |
| `kubernetesVisualizationOptions(string)` |
| `logQuery()` |
| `logQueryTime(string)` |
| `logRequestTime(string)` |
| `openRequestsView()` |
| `queryToClipboard()` |

| Assertions  |
| :------------ |
| `assertVisibilityHeading()` |
| `assertVisibilityTable()` |
| `assertVisibilityVisualization(string)` |
</details>

<details>
<summary>datePicker</summary>

## [datePicker](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/components/date_picker.component.ts)

| Actions  |
| :------------ |
| `clickApplyButton()` |
| `clickDatePicker()` |
| `fillTimeValue(string)` |
| `selectDate()` |
| `selectTimeUnit(string)` |

| Assertions  |
| :------------ |
| `assertDatePickerVisibility()` |
| `assertSelectedDate()` |
</details>

<details>
<summary>dependenciesPage</summary>

## [dependenciesPage](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/pages/dependencies.page.ts)

| Actions  |
| :------------ |
| `clickInvestigateButton()` |
| `clickTableRow()` |
| `clickTimelineTransaction()` |
| `clickTraceLogsButton()` |
| `openOperationsTab()` |

| Assertions  |
| :------------ |
| `assertVisibilityTable()` |
| `assertVisibilityTabPanel()` |
| `assertVisibilityTimelineTransaction()` |
</details>

<details>
<summary>infrastructurePage</summary>

## [infrastructurePage](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/pages/infrastructure.page.ts)

| Actions  |
| :------------ |
| `clickDismiss()` |
| `clickNodeWaffleContainer()` |
| `clickPopoverK8sMetrics()` |
| `clickTableCell()` |
| `closeFlyout()` |
| `closeInfraAssetDetailsFlyout()` |
| `hostsVisualizationOptions(string)` |
| `logQuery()` |
| `openHostsLogs()` |
| `openRequestsView()` |
| `queryToClipboard()` |
| `searchErrors()` |
| `sortByMetricValue()` |
| `switchInventoryToPodsView()` |
| `switchToTableView()` |

| Assertions  |
| :------------ |
| `assertVisibilityPodVisualization(string)` |
| `assertVisibilityVisualization(string)` |
</details>

<details>
<summary>landingPage</summary>

## [landingPage](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/pages/landing.page.ts)

| Actions  |
| :------------ |
| `clickDiscover()` |
| `clickDashboards()` |
| `clickApplications()` |
| `clickServices()` |
| `clickTraces()` |
| `clickDependencies()` |
| `clickInfrastructure()` |
| `clickInventory()` |
| `clickHosts` |
| `clickSettings()` |
| `clickManagement()` |
| `clickFleet()` |
</details>

<details>
<summary>logsExplorerPage</summary>

## [logsExplorerPage](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/pages/logs_explorer.page.ts)

| Actions  |
| :------------ |
| `clickLogsExplorerTab()` |
| `expandLogsDataGridRow()` |
| `filterByNginxAccess()` |
| `filterLogsByError()` |

| Assertions  |
| :------------ |
| `assertVisibilityCanvas()` |
| `assertVisibilityDataGridRow()` |
| `assertVisibilityDocViewer()` |
| `assertVisibilityFlyoutLogMessage()` |
| `assertVisibilityFlyoutService()` |
</details>

<details>
<summary>servicesPage</summary>

## [servicesPage](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/pages/services.page.ts)

| Actions  |
| :------------ |
| `clickInvestigate()` |
| `clickHostLogsButton()` |
| `filterByCorrelationValue()` |
| `filterByFieldValue()` |
| `openFailedTransactionCorrelationsTab()` |
| `openTransactionsTab()` |
| `selectMostImpactfulTransaction()` |
| `selectServiceOpbeansGo()` |

| Assertions  |
| :------------ |
| `assertVisibilityCorrelationButton()` |
| `assertVisibilityErrorDistributionChart()` |
| `assertVisibilityVisualization(string)` |
</details>

<details>
<summary>tracesPage</summary>

## [tracesPage](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/pages/traces.page.ts)

| Actions  |
| :------------ |
| `openExplorerTab()` |
| `clickRelatedError()` |
| `filterBy(string)` |
</details>