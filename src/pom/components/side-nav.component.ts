import { expect, Locator } from "@playwright/test";
import { BasePage } from "../base.page";

export default class SideNav extends BasePage {

    public async goto() {
        await this.page.goto('/');
    }

    public readonly sideNav = () => this.page.locator('xpath=//nav[@data-test-subj="projectLayoutSideNav"]');
    private readonly moreMenuTrigger = () => this.page.getByTestId('kbnChromeNav-moreMenuTrigger');
    private readonly discover = () => this.page.locator('xpath=//a[@id="discover"]');
    private readonly mainNav = () => this.page.getByRole('navigation', { name: 'Main' });
    private readonly agents = () => this.page.getByRole('link', { name: 'Agents', exact: true });
    private readonly dashboards = () => this.mainNav().getByRole('link', { name: 'Dashboards', exact: true });
    private readonly alerts = () => this.page.locator('xpath=//span[contains(text(),"Alerts")]');
    private readonly applications = () => this.page.locator('xpath=//button//*[text()="Applications"]');
    private readonly services = () => this.page.getByRole('link', { name: 'Service inventory' });
    private readonly traces = () => this.page.getByRole('link', { name: 'Traces' });
    private readonly dependencies = () => this.page.getByRole('link', { name: 'Dependencies' });
    private readonly infrastructure = () => this.page.locator('xpath=//button//*[text()="Infrastructure"]');
    private readonly inventory = () => this.page.locator('xpath=//*[contains(text(),"Infrastructure Inventory")]');
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

    /**
     * The "More" popover dismisses itself when the trigger shifts out from under
     * a stationary pointer, which happens while a busy page is still settling.
     * Re-hover until the wanted item is actionable instead of hovering once.
     */
    private async openMoreMenu(item: Locator, description: string) {
        await expect(async () => {
            await this.moreMenuTrigger().hover({ timeout: 5000 });
            await expect(item, description).toBeVisible({ timeout: 5000 });
            }).toPass({ timeout: 30000 });
        }

    public async clickAgents() {
        await this.openMoreMenu(this.agents(), 'Agents navigation link');
        await this.agents().click();
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