import { test as base } from "@playwright/test";
import DashboardPage from "../../pom/serverless/pages/dashboard.page";
import DatePicker from "../../pom/serverless/components/date_picker.component";
import DependenciesPage from "../../pom/serverless/pages/dependencies.page";
import HeaderBar from "../../pom/serverless/components/header_bar.component";
import HostsPage from "../../pom/serverless/pages/hosts.page";
import InventoryPage from "../../pom/serverless/pages/inventory.page";
import DiscoverPage from "../../pom/serverless/pages/discover.page";
import ManagementPage from "../../pom/serverless/pages/management.page";
import Notifications from "../../pom/serverless/components/notifications.component";
import OnboardingPage from "../../pom/serverless/pages/onboarding.page";
import ServicesPage from "../../pom/serverless/pages/services.page";
import SideNav from "../../pom/serverless/components/side_nav.component";
import SpaceSelector from "../../pom/serverless/components/space_selector.component";
import TracesPage from "../../pom/serverless/pages/traces.page";

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