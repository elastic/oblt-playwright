import { Page } from "@playwright/test";
import { Logger } from "winston";
import logger from '../logger';

export abstract class BasePage {
    protected readonly log: Logger;

    constructor(protected readonly page: Page, log?: Logger) {
        this.log = log ?? logger;
    }
}
