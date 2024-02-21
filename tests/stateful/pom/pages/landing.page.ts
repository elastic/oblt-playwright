import { Page } from "@playwright/test";

export default class LandingPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public async goto() {
        await this.page.goto('/');
    }

// Locators
toggleNavButton = () => this.page.getByTestId('toggleNavButton');
homeLink = () => this.page.getByTestId('homeLink');
discover = () => this.page.locator('xpath=//span[@title="Discover"]');
dashboards = () => this.page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]');
observability = () => this.page.locator('xpath=//span[contains(@class,"euiAccordion__buttonContent")]//a[contains(text(),"Observability")]');
observabilitySolutionLink = () => this.page.locator('xpath=//div[@data-test-subj="homSolutionPanel homSolutionPanel_observability"]//a[contains(text(),"Observability")]');
apm = () => this.page.getByRole('link', { name: 'APM' });
alerts = () => this.page.getByTestId('observability-nav-observability-overview-alerts');
infrastructure = () => this.page.getByRole('link', { name: 'Infrastructure' });
stackManagement = () => this.page.locator('xpath=//span[@title="Stack Management"]');


// Actions
public async clicktoggleNavButton() {
    await this.toggleNavButton().click();
    }

public async clickhomeLink() {
    await this.homeLink().click();
    }
    
public async clickDiscover() {
    await this.discover().click();
    }

public async clickDashboards() {
    await this.dashboards().click();
    }

public async clickAlerts() {
    await this.alerts().click();
    }

public async clickObservability() {
    await this.observability().click();
    }

public async clickAPM() {
    await this.apm().click();
}

public async clickInfrastructure() {
    await this.infrastructure().click();
}

public async clickStackManagement() {
    await this.stackManagement().click();
}

public async clickObservabilitySolutionLink() {
    await this.observabilitySolutionLink().click();
    }
}