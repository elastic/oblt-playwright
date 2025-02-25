import { test as base } from "@playwright/test";
import DashboardPage from "../../../tests/serverless/pom/pages/dashboard.page";
import DatePicker from "../../../tests/serverless/pom/components/date_picker.component";
import DependenciesPage from "../../../tests/serverless/pom/pages/dependencies.page";
import HeaderBar from "../../../tests/serverless/pom/components/header_bar.component";
import HostsPage from "../../../tests/serverless/pom/pages/hosts.page";
import InventoryPage from "../../../tests/serverless/pom/pages/inventory.page";
import DiscoverPage from "../../../tests/serverless/pom/pages/discover.page";
import ManagementPage from "../../../tests/serverless/pom/pages/management.page";
import Notifications from "../../../tests/serverless/pom/components/notifications.component";
import OnboardingPage from "../../../tests/serverless/pom/pages/onboarding.page";
import ServicesPage from "../../../tests/serverless/pom/pages/services.page";
import SideNav from "../../../tests/serverless/pom/components/side_nav.component";
import { SpaceSelector } from "../../../tests/serverless/pom/components/space_selector.component";
import TracesPage from "../../../tests/serverless/pom/pages/traces.page";


export const test = base.extend<{
    dashboardPage: DashboardPage, 
    datePicker: DatePicker, 
    dependenciesPage: DependenciesPage,
    headerBar: HeaderBar,
    hostsPage: HostsPage, 
    inventoryPage: InventoryPage, 
    discoverPage: DiscoverPage, 
    managementPage: ManagementPage,
    notifications: Notifications,
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

        datePicker: async({page}, use) => {
            await use(new DatePicker(page));
        },

        dependenciesPage: async({page}, use) => {
            await use(new DependenciesPage(page));
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

        discoverPage: async({page}, use) => {
            await use(new DiscoverPage(page));
        },

        managementPage: async({page}, use) => {
            await use(new ManagementPage(page));
        },

        notifications: async({page}, use) => {
            await use(new Notifications(page));
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