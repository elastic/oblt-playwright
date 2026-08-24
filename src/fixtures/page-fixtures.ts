import { test as base } from "@playwright/test";
import AgentBuilderPage from "../pom/pages/agent-builder.page";
import DashboardPage from "../pom/pages/dashboard.page";
import DatasetsPage from "../pom/pages/datasets.page";
import DatePicker from "../pom/components/date-picker.component";
import DependenciesPage from "../pom/pages/dependencies.page";
import HeaderBar from "../pom/components/header-bar.component";
import HostsPage from "../pom/pages/hosts.page";
import InventoryPage from "../pom/pages/inventory.page";
import DiscoverPage from "../pom/pages/discover.page";
import ManagementPage from "../pom/pages/management.page";
import Notifications from "../pom/components/notifications.component";
import OnboardingPage from "../pom/pages/onboarding.page";
import ServicesPage from "../pom/pages/services.page";
import SideNav from "../pom/components/side-nav.component";
import SpaceSelector from "../pom/components/space-selector.component";
import TracesPage from "../pom/pages/traces.page";
import { createPerfCollector, PerfCollector } from "../helpers/perf-metrics";
import { Logger } from "winston";
import logger from '../logger';

type Fixtures = {
    agentBuilderPage: AgentBuilderPage,
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

        agentBuilderPage: async ({ page, log }, use) => {
            await use(new AgentBuilderPage(page, log));
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
