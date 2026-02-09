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
import { createPerfCollector, PerfCollector } from "../helpers/perf-metrics.ts";
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
    perfMetrics: PerfCollector,
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

        dashboardPage: async ({ page, log }, use) => {
            await use(new DashboardPage(page, log));
        },

        datasetsPage: async ({ page, log }, use) => {
            await use(new DatasetsPage(page, log));
        },

        datePicker: async ({ page, log }, use) => {
            await use(new DatePicker(page, log));
        },

        dependenciesPage: async ({ page, log }, use) => {
            await use(new DependenciesPage(page, log));
        },

        headerBar: async ({ page, log }, use) => {
            await use(new HeaderBar(page, log));
        },

        hostsPage: async ({ page, log }, use) => {
            await use(new HostsPage(page, log));
        },

        inventoryPage: async ({ page, log }, use) => {
            await use(new InventoryPage(page, log));
        },

        discoverPage: async ({ page, log }, use) => {
            await use(new DiscoverPage(page, log));
        },

        managementPage: async ({ page, log }, use) => {
            await use(new ManagementPage(page, log));
        },

        notifications: async ({ page, log }, use) => {
            await use(new Notifications(page, log));
        },

        onboardingPage: async ({ page, log }, use) => {
            await use(new OnboardingPage(page, log));
        },

        servicesPage: async ({ page, log }, use) => {
            await use(new ServicesPage(page, log));
        },

        sideNav: async ({ page, log }, use) => {
            await use(new SideNav(page, log));
        },

        spaceSelector: async ({ page, log }, use) => {
            await use(new SpaceSelector(page, log));
        },

        perfMetrics: async ({ page, log }, use) => {
            const perf = await createPerfCollector(page, log);
            await use(perf);
            await perf.dispose();
        },

        tracesPage: async ({ page, log }, use) => {
            await use(new TracesPage(page, log));
        }
    });