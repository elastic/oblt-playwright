import { test as base } from "@playwright/test";
import DashboardPage from "./pages/dashboard.page";
import DatasetsPage from "./pages/datasets.page";
import DatePicker from "./components/date-picker.component";
import DependenciesPage from "./pages/dependencies.page";
import HeaderBar from "./components/header-bar.component";
import HostsPage from "./pages/hosts.page";
import InventoryPage from "./pages/inventory.page";
import DiscoverPage from "./pages/discover.page";
import ManagementPage from "./pages/management.page";
import Notifications from "./components/notifications.component";
import OnboardingPage from "./pages/onboarding.page";
import ServicesPage from "./pages/services.page";
import SideNav from "./components/side-nav.component";
import SpaceSelector from "./components/space-selector.component";
import TracesPage from "./pages/traces.page";
import { Logger } from "winston";
import logger from '../logger';

type Fixtures = {
    dashboardPage: DashboardPage,
    datasetsPage: DatasetsPage,
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
    tracesPage: TracesPage,
    log: Logger
};

export const test = base.extend<Fixtures>
    ({
        log: async ({}, use, testInfo) => {
            const contextLogger = logger.child({
                project: testInfo.project.name,
                testName: testInfo.title,
                workerIndex: testInfo.workerIndex,
            });
            await use(contextLogger);
        },

        dashboardPage: async ({ page }, use) => {
            await use(new DashboardPage(page));
        },

        datasetsPage: async ({ page }, use) => {
            await use(new DatasetsPage(page));
        },

        datePicker: async ({ page }, use) => {
            await use(new DatePicker(page));
        },

        dependenciesPage: async ({ page }, use) => {
            await use(new DependenciesPage(page));
        },

        headerBar: async ({ page }, use) => {
            await use(new HeaderBar(page));
        },

        hostsPage: async ({ page }, use) => {
            await use(new HostsPage(page));
        },

        inventoryPage: async ({ page }, use) => {
            await use(new InventoryPage(page));
        },

        discoverPage: async ({ page }, use) => {
            await use(new DiscoverPage(page));
        },

        managementPage: async ({ page }, use) => {
            await use(new ManagementPage(page));
        },

        notifications: async ({ page }, use) => {
            await use(new Notifications(page));
        },

        onboardingPage: async ({ page }, use) => {
            await use(new OnboardingPage(page));
        },

        servicesPage: async ({ page }, use) => {
            await use(new ServicesPage(page));
        },

        sideNav: async ({ page }, use) => {
            await use(new SideNav(page));
        },

        spaceSelector: async ({ page }, use) => {
            await use(new SpaceSelector(page));
        },

        tracesPage: async ({ page }, use) => {
            await use(new TracesPage(page));
        }
    });