import { Page } from '@playwright/test';

export const reviewPageStep = async (waitTime: number) => {
    await new Promise((resolve) => setTimeout(resolve, waitTime));
};

async function waitForLocatorDetach(page: Page, loadingIndicatorSelector: string, timeoutWaitTime: 0) {
    // give the page 1.5 seconds to display the global loading indicator
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const overviewLocator = page.getByTestId(loadingIndicatorSelector);
    if (timeoutWaitTime > 0) {
        await overviewLocator.waitFor({ state: 'detached', timeout: timeoutWaitTime });
    }
    else {
        await overviewLocator.waitFor({ state: 'detached' });
    }
};

export const loginStep = async (page: Page, url: string, username: string, password: string) => {
    // await page.goto(url + '/login');
    await page.goto(url);
    // login
    await page.getByRole('textbox', { name: 'email' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill(username);
    await page.getByRole('textbox', { name: 'email' }).press('Tab');
    await page.getByRole('textbox', { name: 'password' }).fill(password);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await page.getByRole('button').getByText('Log in', { exact: true }).click();
    // select default space
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await page.goto(url + '/spaces/enter');
    // wait for the getting started page
    await page.waitForURL('**/app/security/get_started');
    const setupPageLocator = page.getByText('Welcome to Elastic Security', { exact: true });
    await setupPageLocator.waitFor({ state: 'visible' });
};

export const overviewPageStep = async (page: Page) => {
    // navigate to the overview page
    await page.locator('.euiFlexItem > .euiButtonIcon').first().click();
    await page.getByRole('link', { name: 'Overview' }).click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const overviewPageRevisitStep = async (page: Page) => {
    // navigate to the overview page
    await page.locator('.euiFlexItem > .euiButtonIcon').first().click();
    await page.getByRole('link', { name: 'Overview' }).click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const overviewPageRefreshStep = async (page: Page) => {
    // refresh the overview page
    await page.getByTestId('querySubmitButton').click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const overviewViewAlertsStep = async (page: Page) => {
    // click the view alerts button on the overview page
    await page.getByTestId('alerts-histogram-panel-go-to-alerts-page').click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const hostsPageStep = async (page: Page) => {
    // navigate to Hosts
    await page.getByRole('link', { name: 'Explore' }).click();
    page.getByTestId('LandingItem');
    await page.click('text=Hosts');
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const hostsUncommonProcessesTabStep = async (page: Page) => {
    // navigate to the Uncommon processes tab on the hosts page
    await page.getByTestId('navigation-uncommonProcesses').click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const hostsAnomaliesTabStep = async (page: Page) => {
    // navigate to the Anomalies tab on the hosts page
    await page.getByTestId('navigation-anomalies').click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const networksPageStep = async (page: Page) => {
    // navigate to the Networks page
    await page.getByRole('link', { name: 'Explore' }).first().click();
    page.getByTestId('LandingItem');
    await page.click('text=Network');
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const detectionsResponsePageStep = async (page: Page) => {
    await page.getByRole('link', { name: 'Dashboards' }).first().click();
    page.getByTestId('LandingImageCard-image');
    await page.click('text="Detection & Response"');
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const alertsPageStep = async (page: Page) => {
    // navigate to the Alerts page
    page.getByTestId('solutionSideNavItemLink-alerts');
    await page.click('text=Alerts');
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const alertsCountsTabStep = async (page: Page) => {
    // navigate to the Anomalies tab on the hosts page
    await page.getByTestId('chart-select-table').click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const alertsSeverityCriticalStep = async (page: Page) => {
    // open severity list
    await page.getByTestId('optionsList-control-1').click();
    // select cirtical from severity list
    await page.getByTestId('optionsList-control-selection-critical').click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
    // clear the open select list
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await page.keyboard.press('Escape');
};

export const alertsSelectFirstHostStep = async (page: Page) => {
    // select the first host in the host list
    await page.getByRole('combobox', { name: 'Host' }).click();
    await page.getByLabel('Available options for host.name').getByRole('option').nth(1).click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
    // clear the open select list
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await page.keyboard.press('Escape');
};

export const alertsCreateCaseStep = async (page: Page, title: string) => {
    // select the second alert and open the detail flyout
    await page.getByLabel(/^View details for the alert or event in row 2/i).first().click();
    // use the take action button to create a new case
    await page.getByRole('button', { name: 'Take action' }).click();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await page.getByRole('button', { name: 'Add to new case' }).click();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // enter the name for the case
    // await page.getByLabel('Name').click();
    await page.getByRole('textbox', { name: 'Name' }).click();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // await page.getByLabel('Name').fill(title);
    await page.getByRole('textbox', { name: 'Name' }).fill(title);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // set the severity to medium
    await page.getByTestId('case-severity-selection').click();
    await page.getByTestId('case-severity-selection-medium').click();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // enter a comment
    await page.getByTestId('euiMarkdownEditorTextArea').fill('Comment for synthetic scenario 3 test case.');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // create the case
    await page.getByRole('button', { name: 'Create case' }).click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const casesPageStep = async (page: Page) => {
    // navigate to Cases page
    await page.getByRole('link', { name: 'Cases' }).click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const updateCaseStep = async (page: Page, title: string, newSeverity = '', newComment = '') => {
    // open the case for editing, use nth(0) to get the first one in case a prior run failed and there are multiples
    await page.getByTitle(title).nth(0).click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
    if (newComment != '') {
        // comment text was passed so add a comment
        await page.getByTestId('euiMarkdownEditorTextArea').fill(newComment);
        await page.getByRole('button', { name: 'Add comment' }).click();
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    if (newSeverity != '') {
        // severity was passed so update the case with the desired severity
        await page.getByTestId('case-severity-selection').click();
        await page.getByTestId('case-severity-selection-low').click();
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    // return to cases list page
    await page.getByTestId('backToCases').click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const closeCaseStep = async (page: Page, title: string) => {
    // need to already be on the Cases page
    // create a regex using the title param
    const regex = new RegExp(title);
    // click the actions button for the row with the title
    await page.getByRole('row', { name: regex }).first().getByLabel('Actions').first().click();
    // click the status button
    await page.getByText(/Status: .*/).click();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // click the closed status
    await page.getByRole('button', { name: 'Closed' }).click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const deleteCaseStep = async (page: Page, title: string) => {
    // need to already be on the Cases page
    // create a regex using the title param
    const regex = new RegExp(title);
    // click the actions button for the row with the title
    await page.getByRole('row', { name: regex }).first().getByLabel('Actions').click();
    // click the delete button
    await page.getByText('Delete case').click();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await page.getByRole('button', { name: 'Delete case' }).click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const setLast7Days = async (page: Page, params: object) => {
    await page.waitForSelector('[data-test-subj="globalQueryBar"]');
    await page.getByTestId('globalQueryBar').getByTestId('superDatePickerToggleQuickMenuButton').first().click();
    await page.getByTestId('superDatePickerCommonlyUsed_Last_7 days').click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};

export const setLast30Days = async (page: Page, params: object) => {
    await page.waitForSelector('[data-test-subj="globalQueryBar"]');
    await page.getByTestId('globalQueryBar').getByTestId('superDatePickerToggleQuickMenuButton').first().click();
    await page.getByTestId('superDatePickerCommonlyUsed_Last_30 days').click();
    await waitForLocatorDetach(page, 'globalLoadingIndicator', 0);
};