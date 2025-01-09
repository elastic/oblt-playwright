import { expect, Page } from "@playwright/test";

export default class SideNav {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public async goto() {
        await this.page.goto('/');
    }

    public readonly sideNav = () => this.page.locator('xpath=//div[@data-test-subj="svlObservabilitySideNav"]');
    private readonly discover = () => this.page.locator('xpath=//a[@id="discover"]');
    private readonly dashboards = () => this.page.locator('xpath=//div[@class="euiFlyoutBody__overflowContent"]//*[contains(text(),"Dashboards")]');
    private readonly alerts = () => this.page.locator('xpath=//span[contains(text(),"Alerts")]');
    private readonly applications = () => this.page.locator('xpath=//button//*[text()="Applications"]');
    private readonly services = () => this.page.getByRole('link', { name: 'Service inventory' });
    private readonly traces = () => this.page.getByRole('link', { name: 'Traces' });
    private readonly dependencies = () => this.page.getByRole('link', { name: 'Dependencies' });
    private readonly infrastructure = () => this.page.locator('xpath=//button//*[text()="Infrastructure"]');
    private readonly inventory = () => this.page.locator('xpath=//*[contains(text(),"Infrastructure inventory")]');
    private readonly hosts = () => this.page.getByRole('link', { name: 'Hosts' });
    private readonly projectSettings = () => this.page.locator('xpath=//button[@aria-controls="project_settings_project_nav"][2]');
    private readonly projectManagement = () => this.page.locator('xpath=//span[contains(text(),"Management")]');
    private readonly fleet = () => this.page.locator('xpath=//span[contains(text(),"Fleet")]');

    public async assertSideNav() {
        await expect(this.sideNav(), 'Side navigation panel').toBeVisible();
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

    public async clickInfrastructure() {
        await this.infrastructure().click();
        }

    public async clickInventory() {
        await this.inventory().click();
        }

    public async clickHosts() {
        await this.hosts().click();
        }

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