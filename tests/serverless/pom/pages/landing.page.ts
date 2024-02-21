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
discover = () => this.page.locator('xpath=//a[@id="observability-log-explorer"]');
dashboards = () => this.page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]');
alerts = () => this.page.locator('xpath=//span[contains(text(),"Alerts")]');
applications = () => this.page.getByTestId('accordionArrow accordionArrow-observability_project_nav.apm');
services = () => this.page.getByRole('link', { name: 'Services' });
traces = () => this.page.getByRole('link', { name: 'Traces' });
dependencies = () => this.page.getByRole('link', { name: 'Dependencies' });

infrastructure = () => this.page.getByTestId('accordionArrow accordionArrow-observability_project_nav.metrics');
inventory = () => this.page.locator('xpath=//*[contains(text(),"Inventory")]');
hosts = () => this.page.getByRole('link', { name: 'Hosts' });

projectSettings = () => this.page.locator('xpath=//button[@aria-controls="project_settings_project_nav"][2]');
projectManagement = () => this.page.locator('xpath=//span[contains(text(),"Management")]');
fleet = () => this.page.locator('xpath=//span[contains(text(),"Fleet")]');

public async clickDiscover() {
    await this.discover().click();
    }

public async clickDashboards() {
    await this.dashboards().click();
    }

public async clickAlerts() {
    await this.alerts().click();
    }

// Applications actions
public async clickApplications() {
    await this.applications().click();
}

public async clickServices() {
    await this.services().click();
}

public async clickTraces() {
    await this.traces().click();
}

public async clickDependencies() {
    await this.dependencies().click();
}

// Infrastructure actions
public async clickInfrastructure() {
    await this.infrastructure().click();
}

public async clickInventory() {
    await this.inventory().click();
}

public async clickHosts() {
    await this.hosts().click();
}

// Project settings actions
public async clickSettings() {
    await this.projectSettings().click();
}

public async clickManagement() {
    await this.projectManagement().click();
}

public async clickFleet() {
    await this.fleet().click();
}

}