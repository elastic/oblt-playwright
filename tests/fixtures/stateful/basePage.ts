import { test as base } from "@playwright/test";
import DashboardPage from "../../stateful/pom/pages/dashboard.page";
import DatasetsPage from "../../stateful/pom/pages/datasets.page";
import DatePicker from "../../stateful/pom/components/date_picker.component";
import DependenciesPage from "../../stateful/pom/pages/dependencies.page";
import DiscoverPage from "../../stateful/pom/pages/discover.page";
import HeaderBar from "../../stateful/pom/components/header_bar.component";
import HostsPage from "../../stateful/pom/pages/hosts.page";
import InventoryPage from "../../stateful/pom/pages/inventory.page";
import LogsExplorerPage from "../../stateful/pom/pages/logs_explorer.page";
import Notifications from "../../stateful/pom/components/notifications.component";
import ObservabilityPage from "../../stateful/pom/pages/observability.page";
import OnboardingPage from "../../stateful/pom/pages/onboarding.page";
import ServicesPage from "../../stateful/pom/pages/services.page";
import SideNav from "../../stateful/pom/components/side_nav.component";
import { SpaceSelector } from "../../stateful/pom/components/space_selector.component";
import TracesPage from "../../stateful/pom/pages/traces.page";


export const test = base.extend<{
    dashboardPage: DashboardPage, 
    datasetsPage: DatasetsPage, 
    datePicker: DatePicker, 
    dependenciesPage: DependenciesPage, 
    discoverPage: DiscoverPage,
    headerBar: HeaderBar,
    hostsPage: HostsPage, 
    inventoryPage: InventoryPage, 
    logsExplorerPage: LogsExplorerPage,
    notifications: Notifications, 
    observabilityPage: ObservabilityPage,
    onboardingPage: OnboardingPage, 
    servicesPage: ServicesPage,
    sideNav: SideNav, 
    spaceSelector: SpaceSelector,
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

        headerBar: async({page}, use) => {
            await use(new HeaderBar(page));
        },

        hostsPage: async({page}, use) => {
            await use(new HostsPage(page));
        },
        
        inventoryPage: async({page}, use) => {
            await use(new InventoryPage(page));
        },

        logsExplorerPage: async({page}, use) => {
            await use(new LogsExplorerPage(page));
        },

        notifications: async({page}, use) => {
            await use(new Notifications(page));
        },

        observabilityPage: async({page}, use) => {
            await use(new ObservabilityPage(page));
        },

        onboardingPage: async({page}, use) => {
            await use(new OnboardingPage(page));
        },

        servicesPage: async({page}, use) => {
            await use(new ServicesPage(page));
        },

        sideNav: async({page}, use) => {
            await use(new SideNav(page));
        },

        spaceSelector: async({page}, use) => {
            await use(new SpaceSelector(page));
        },

        tracesPage: async({page}, use) => {
            await use(new TracesPage(page));
        }
    });