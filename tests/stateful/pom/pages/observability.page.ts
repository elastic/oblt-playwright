import { Page } from "@playwright/test";

export default class ObservabilityPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

// Locators
alerts = () => this.page.getByTestId('observability-nav-observability-overview-alerts');
explorer = () => this.page.getByTestId('observability-nav-observability-logs-explorer-explorer');
services = () => this.page.getByTestId('observability-nav-apm-services');
traces = () => this.page.getByTestId('observability-nav-apm-traces');
dependencies = () => this.page.getByTestId('observability-nav-apm-dependencies');
inventory = () => this.page.getByTestId('observability-nav-metrics-inventory');
metricsExplorer = () => this.page.getByTestId('observability-nav-metrics-metrics_explorer');
hosts = () => this.page.getByTestId('observability-nav-metrics-hosts');

// Actions
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