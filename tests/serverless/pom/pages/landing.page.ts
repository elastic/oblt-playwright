import { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export default class LandingPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public async goto() {
        await this.page.goto('/');
    }

    readonly spaceSelector = () => this.page.locator('xpath=//h1[contains(text(),"Select your space")]');
    private readonly discover = () => this.page.locator('xpath=//a[@id="observability-log-explorer"]');
    private readonly dashboards = () => this.page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]');
    private readonly alerts = () => this.page.locator('xpath=//span[contains(text(),"Alerts")]');
    private readonly applications = () => this.page.getByTestId('accordionArrow accordionArrow-observability_project_nav.apm');
    private readonly services = () => this.page.getByRole('link', { name: 'Services' });
    private readonly traces = () => this.page.getByRole('link', { name: 'Traces' });
    private readonly dependencies = () => this.page.getByRole('link', { name: 'Dependencies' });
    private readonly infrastructure = () => this.page.getByTestId('accordionArrow accordionArrow-observability_project_nav.metrics');
    private readonly inventory = () => this.page.locator('xpath=//*[contains(text(),"Inventory")]');
    private readonly hosts = () => this.page.getByRole('link', { name: 'Hosts' });
    private readonly projectSettings = () => this.page.locator('xpath=//button[@aria-controls="project_settings_project_nav"][2]');
    private readonly projectManagement = () => this.page.locator('xpath=//span[contains(text(),"Management")]');
    private readonly fleet = () => this.page.locator('xpath=//span[contains(text(),"Fleet")]');

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