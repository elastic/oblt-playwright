import { test as base } from "@playwright/test";
import DashboardPage from "../../pom/stateful/pages/dashboard.page";
import DatasetsPage from "../../pom/stateful/pages/datasets.page";
import DatePicker from "../../pom/stateful/components/date_picker.component";
import DependenciesPage from "../../pom/stateful/pages/dependencies.page";
import DiscoverPage from "../../pom/stateful/pages/discover.page";
import HeaderBar from "../../pom/stateful/components/header_bar.component";
import HostsPage from "../../pom/stateful/pages/hosts.page";
import InventoryPage from "../../pom/stateful/pages/inventory.page";
import Notifications from "../../pom/stateful/components/notifications.component";
import ObservabilityPage from "../../pom/stateful/pages/observability.page";
import OnboardingPage from "../../pom/stateful/pages/onboarding.page";
import ServicesPage from "../../pom/stateful/pages/services.page";
import SideNav from "../../pom/stateful/components/side_nav.component";
import SpaceSelector from "../../pom/stateful/components/space_selector.component";
import TracesPage from "../../pom/stateful/pages/traces.page";

export const test = base.extend<{
    dashboardPage: DashboardPage, 
    datasetsPage: DatasetsPage, 
    datePicker: DatePicker, 
    dependenciesPage: DependenciesPage, 
    discoverPage: DiscoverPage,
    headerBar: HeaderBar,
    hostsPage: HostsPage, 
    inventoryPage: InventoryPage,
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