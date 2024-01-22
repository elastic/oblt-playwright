import {test as base} from "@playwright/test";
import LandingPage from "../../serverless/pom/pages/landing.page";
import DashboardPage from "../../serverless/pom/pages/dashboard.page";
import DatePicker from "../../serverless/pom/components/date_picker.component";

export const test = base.extend<{landingPage: LandingPage, dashboardPage: DashboardPage, datePicker: DatePicker}>
({
    landingPage: async({page}, use) => {
        await use(new LandingPage(page));
    },

    dashboardPage: async({page}, use) => {
        await use(new DashboardPage(page));
    },

    datePicker: async({page}, use) => {
        await use(new DatePicker(page));
    }
});