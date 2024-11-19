# How to create a new test

Use the following code as a basis for a new test file:
```
import {test} from '../../tests/fixtures/serverless/basePage';

test.beforeEach(async ({ sideNav }) => {
  await sideNav.goto();
  await sideNav.<test section>;
});

test('<test name>', async ({page, <fixtures>}) => { 
    await test.step('<step name>', async () => {
        // Put your code here
        await <page>.<method>;
        await <page>.<method>;
    });
});

test('<test name>', async ({page, <fixtures>}) => {
    await test.step('<step name>', async () => {
        // Put your code here
        await <page>.<method>;
        await <page>.<method>;
    });
});
```
|   | Tip |
| ------------- | ------------- |
| `<test section>`  | [Navigation method](https://github.com/elastic/oblt-playwright/blob/main/docs/guidelines.md#landingpage) to a target section.<br><br>Example:<br><br>`clickInfrastructure();`  |
| `<fixtures>`  | [Pages/components](https://github.com/elastic/oblt-playwright/blob/main/docs/guidelines.md#available-methods) that you're going to use.<br><br>Example:<br><br>`{ datePicker, sideNav, discoverPage, page, servicesPage }`<br><br>Note: `page` is always required.  |
| `<step name>`  | In a test report, `<step name>` is used as a property of the step duration: `"step01": 4351`, hence apply JSON property name format here.<br><br>Example:<br><br>`step01` |
| `<page>.<method>` | Specify target page and desired action separated by a dot.<br>Use [this section](https://github.com/elastic/oblt-playwright/blob/main/docs/guidelines.md#available-methods) to check what methods are available for the specified page/component.<br><br>Example:<br><br>`await discoverPage.clickLogsExplorerTab();`<br>`await discoverPage.assertVisibilityCanvas();`<br>`await discoverPage.assertVisibilityDataGridRow();`<br><br>Some methods require passing a parameter:<br><br>`assertVisibilityVisualization(string)`<br><br>For example, you might need to pass a visualization name:<br><br>`assertVisibilityVisualization('infraAssetDetailsKPIcpuUsage')`<br><br>If a method is used repeatedly across the test, it is recommended adding a variable for the value:<br><br>`const cpuUsage = 'infraAssetDetailsKPIcpuUsage';`<br>`await infrastructurePage.assertVisibilityVisualization(cpuUsage);` |

**General tip:**

[Make tests as isolated as possible](https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible)

> Each test should be completely isolated from another test and should run independently with its own local storage, session storage, data, cookies etc. [Test isolation](https://playwright.dev/docs/browser-contexts) improves reproducibility, makes debugging easier and prevents cascading test failures.

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
| `assertVisibilityDatePicker()` |
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
<summary>sideNav</summary>

## [sideNav](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/pages/landing.page.ts)

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
<summary>discoverPage</summary>

## [discoverPage](https://github.com/elastic/oblt-playwright/blob/main/tests/serverless/pom/pages/logs_explorer.page.ts)

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

## Adding a new method to existing page/component model

Check if there's a locator to UI element you need to interact with among [available](https://github.com/elastic/oblt-playwright/tree/main/tests/serverless/pom) for that page. If there's not, add a new one using the following template:

```
<locatorFunction> = () => this.page.<locator>;
```
|   | Tip  |
| :------------ | ------------- |
| `<locatorFunction>` | Example:<br><br>`logsExplorerTab` |
| `<locator>` | Specify a locator to UI element.<br>Check this [guide](https://playwright.dev/docs/locators) on locating elements.<br><br>Examples:<br><br>`getByTestId('logExplorerTab')`<br>`locator('xpath=//canvas[contains(@class, "echCanvasRenderer")]')`<br>`getByRole('link', { name: 'Traces' })` |

Now create a method using that locator(s).

```
public async <methodName>(<parameters>) {
        await this.<locatorFunction>.<action>;
        }
```

|   | Tip  |
| :------------ | ------------- |
| `<methodName>` | Example:<br><br>`expandLogsDataGridRow()` |
| `<parameters>` | Example:<br><br>`assertVisibilityPodVisualization(title: string)` |
| `<locatorFunction>` | Specify a locator function.<br><br>Examples:<br><br>`logsExplorerTab()` |
| `<action>` | Specify an action to perform against a locator. See this [page](https://playwright.dev/docs/input) to check available actions.<br><br>Examples:<br><br>`click()`<br>`fill('error')` |
