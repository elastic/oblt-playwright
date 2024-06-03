import {test as base} from "@playwright/test";
import DashboardPage from "../../stateful/pom/pages/dashboard.page";
import DatasetsPage from "../../stateful/pom/pages/datasets.page";
import DatePicker from "../../stateful/pom/components/date_picker.component";
import DependenciesPage from "../../stateful/pom/pages/dependencies.page";
import DiscoverPage from "../../stateful/pom/pages/discover.page";
import HostsPage from "../../stateful/pom/pages/hosts.page";
import InventoryPage from "../../stateful/pom/pages/inventory.page";
import LandingPage from "../../stateful/pom/pages/landing.page";
import LogsExplorerPage from "../../stateful/pom/pages/logs_explorer.page";
import ObservabilityPage from "../../stateful/pom/pages/observability.page";
import ServicesPage from "../../stateful/pom/pages/services.page";
import TracesPage from "../../stateful/pom/pages/traces.page";


export const test = base.extend<{
    dashboardPage: DashboardPage, 
    datasetsPage: DatasetsPage, 
    datePicker: DatePicker, 
    dependenciesPage: DependenciesPage, 
    discoverPage: DiscoverPage,
    hostsPage: HostsPage, 
    inventoryPage: InventoryPage, 
    landingPage: LandingPage, 
    logsExplorerPage: LogsExplorerPage, 
    observabilityPage: ObservabilityPage, 
    servicesPage: ServicesPage, 
    tracesPage: TracesPage
    }>
    ({
        dashboardPage: async({page}, use) => {
            await use(new DashboardPage(page));
        },

        datasetsPage: async({page}, use) => {
            await use(new DatasetsPage(page));
        },

        datePicker: async({page}, use) => {
            await use(new DatePicker(page));
        },

        dependenciesPage: async({page}, use) => {
            await use(new DependenciesPage(page));
        },

        discoverPage: async({page}, use) => {
            await use(new DiscoverPage(page));
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

        observabilityPage: async({page}, use) => {
            await use(new ObservabilityPage(page));
        },

        servicesPage: async({page}, use) => {
            await use(new ServicesPage(page));
        },

        tracesPage: async({page}, use) => {
            await use(new TracesPage(page));
        }
    });