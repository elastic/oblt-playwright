import { Page } from "@playwright/test";

export default class ObservabilityPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly alerts = () => this.page.getByTestId('observability-nav-observability-overview-alerts');
    private readonly discover = () => this.page.locator('xpath=//a[@data-nav-id="discover"]');
    private readonly services = () => this.page.getByTestId('observability-nav-apm-service_inventory');
    private readonly traces = () => this.page.getByTestId('observability-nav-apm-traces');
    private readonly dependencies = () => this.page.getByTestId('observability-nav-apm-dependencies');
    private readonly inventory = () => this.page.getByTestId('observability-nav-metrics-infrastructure_inventory');
    private readonly metricsExplorer = () => this.page.getByTestId('observability-nav-metrics-metrics_explorer');
    private readonly hosts = () => this.page.getByTestId('observability-nav-metrics-hosts');

    public async clickAlerts() {
        await this.alerts().click();
    }

    public async clickDiscover() {
        await this.discover().click();
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

    public async clickInventory() {
        await this.inventory().click();
    }

    public async clickMetricsExplorer() {
        await this.metricsExplorer().click();
    }

    public async clickHosts() {
        await this.hosts().click();
    }
}