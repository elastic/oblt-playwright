import {test as base} from "@playwright/test";
// import AlertsPage from "../../stateful/pom/pages/alerts.page";
// import DashboardPage from "../../stateful/pom/pages/dashboard.page";
import DatasetsPage from "../../stateful/pom/pages/datasets.page";
import DatePicker from "../../stateful/pom/components/date_picker.component";
import DependenciesPage from "../../stateful/pom/pages/dependencies.page";
import DiscoverPage from "../../stateful/pom/pages/discover.page";
//import InfrastructurePage from "../../stateful/pom/pages/infrastructure.page";
import LandingPage from "../../stateful/pom/pages/landing.page";
import LogsExplorerPage from "../../stateful/pom/pages/logs_explorer.page";
import ObservabilityPage from "../../stateful/pom/pages/observability.page";
import ServicesPage from "../../stateful/pom/pages/services.page";
import TracesPage from "../../stateful/pom/pages/traces.page";


export const test = base.extend<{
    alertsPage: AlertsPage, 
    dashboardPage: DashboardPage, 
    datasetsPage: DatasetsPage, 
    datePicker: DatePicker, 
    dependenciesPage: DependenciesPage, 
    discoverPage: DiscoverPage, 
    infrastructurePage: InfrastructurePage, 
    landingPage: LandingPage, 
    logsExplorerPage: LogsExplorerPage, 
    observabilityPage: ObservabilityPage, 
    servicesPage: ServicesPage, 
    tracesPage: TracesPage
    }>
({
    alertsPage: async({page}, use) => {
        await use(new AlertsPage(page));
    },
    
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
    
    infrastructurePage: async({page}, use) => {
        await use(new InfrastructurePage(page));
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