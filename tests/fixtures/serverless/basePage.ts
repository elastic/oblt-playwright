import {test as base} from "@playwright/test";
import AlertsPage from "../../serverless/pom/pages/alerts.page";
import DashboardPage from "../../serverless/pom/pages/dashboard.page";
import DatePicker from "../../serverless/pom/components/date_picker.component";
import DependenciesPage from "../../serverless/pom/pages/dependencies.page";
import HostsPage from "../../serverless/pom/pages/hosts.page";
import InventoryPage from "../../serverless/pom/pages/inventory.page";
import LandingPage from "../../serverless/pom/pages/landing.page";
import LogsExplorerPage from "../../serverless/pom/pages/logs_explorer.page";
import ServicesPage from "../../serverless/pom/pages/services.page";
import TracesPage from "../../serverless/pom/pages/traces.page";


export const test = base.extend<{alertsPage: AlertsPage, dashboardPage: DashboardPage, datePicker: DatePicker, dependenciesPage: DependenciesPage, hostsPage: HostsPage, inventoryPage: InventoryPage, landingPage: LandingPage, logsExplorerPage: LogsExplorerPage, servicesPage: ServicesPage, tracesPage: TracesPage}>
({
    alertsPage: async({page}, use) => {
        await use(new AlertsPage(page));
    },
    
    dashboardPage: async({page}, use) => {
        await use(new DashboardPage(page));
    },

    datePicker: async({page}, use) => {
        await use(new DatePicker(page));
    },

    dependenciesPage: async({page}, use) => {
        await use(new DependenciesPage(page));
    },

    hostsPage: async({page}, use) => {
        await use(new HostsPage(page));
    },
    
    inventoryPage: async({page}, use) => {
        await use(new InventoryPage(page));
    },
    
    landingPage: async({page}, use) => {
        await use(new LandingPage(page));
    },

    logsExplorerPage: async({page}, use) => {
        await use(new LogsExplorerPage(page));
    },

    servicesPage: async({page}, use) => {
        await use(new ServicesPage(page));
    },

    tracesPage: async({page}, use) => {
        await use(new TracesPage(page));
    }
});