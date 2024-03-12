import { Page } from "@playwright/test";

export default class ObservabilityPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private readonly alerts = () => this.page.getByTestId('observability-nav-observability-overview-alerts');
    private readonly explorer = () => this.page.getByTestId('observability-nav-observability-logs-explorer-explorer');
    private readonly services = () => this.page.getByTestId('observability-nav-apm-services');
    private readonly traces = () => this.page.getByTestId('observability-nav-apm-traces');
    private readonly dependencies = () => this.page.getByTestId('observability-nav-apm-dependencies');
    private readonly inventory = () => this.page.getByTestId('observability-nav-metrics-inventory');
    private readonly metricsExplorer = () => this.page.getByTestId('observability-nav-metrics-metrics_explorer');
    private readonly hosts = () => this.page.getByTestId('observability-nav-metrics-hosts');

    public async clickAlerts() {
        await this.alerts().click();
    }

    public async clickExplorer() {
        await this.explorer().click();
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