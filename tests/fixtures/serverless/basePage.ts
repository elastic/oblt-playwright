import {test as base} from "@playwright/test";
import DashboardPage from "../../serverless/pom/pages/dashboard.page";
import DatePicker from "../../serverless/pom/components/date_picker.component";
import DependenciesPage from "../../serverless/pom/pages/dependencies.page";
import HostsPage from "../../serverless/pom/pages/hosts.page";
import InventoryPage from "../../serverless/pom/pages/inventory.page";
import LandingPage from "../../serverless/pom/pages/landing.page";
import LogsExplorerPage from "../../serverless/pom/pages/logs_explorer.page";
import ManagementPage from "../../serverless/pom/pages/management.page";
import ServicesPage from "../../serverless/pom/pages/services.page";
import TracesPage from "../../serverless/pom/pages/traces.page";


export const test = base.extend<{
    dashboardPage: DashboardPage, 
    datePicker: DatePicker, 
    dependenciesPage: DependenciesPage, 
    hostsPage: HostsPage, 
    inventoryPage: InventoryPage, 
    landingPage: LandingPage, 
    logsExplorerPage: LogsExplorerPage, 
    managementPage: ManagementPage,
    servicesPage: ServicesPage, 
    tracesPage: TracesPage
    }>
    ({
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

        managementPage: async({page}, use) => {
            await use(new ManagementPage(page));
        },

        servicesPage: async({page}, use) => {
            await use(new ServicesPage(page));
        },

        tracesPage: async({page}, use) => {
            await use(new TracesPage(page));
        }
    });