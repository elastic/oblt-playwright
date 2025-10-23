import { test, expect } from "@playwright/test";
import {
    getDocCount,
    fetchClusterData,
    checkKibanaAvailability,
    checkIndexExists,
    checkIndexTemplateExists,
    createIndexTemplate,
    createIndex
} from "../src/helpers.ts";
import { logger } from "../src/logger.ts";
import { ABSOLUTE_TIME_RANGE, END_DATE, START_DATE, TIME_UNIT, TIME_VALUE } from "../src/env.ts";

test("Environment check", async ({ page }) => {
    logger.info("Checking Elasticsearch availability...");
    const clusterData: any = await fetchClusterData();
    expect(clusterData).toBeDefined();
    expect(clusterData.cluster_name).toBeDefined();
    expect(clusterData.version).toBeDefined();
    logger.info(`Elasticsearch is available.`);
    
    logger.info("Checking Kibana availability...");
    const kibanaStatus: any = await checkKibanaAvailability(page);
    expect(kibanaStatus.available).toBe(true);
    expect(kibanaStatus.status).toBe(200);
    logger.info(`Kibana is available.`);
})

test("Time range configuration check", async () => {
    logger.info("Checking time range configuration...");
    if (ABSOLUTE_TIME_RANGE) {
        expect(START_DATE, "START_DATE must be set when ABSOLUTE_TIME_RANGE is true").toBeDefined();
        expect(START_DATE, "START_DATE must not be empty when ABSOLUTE_TIME_RANGE is true").not.toBe('');
        expect(END_DATE, "END_DATE must be set when ABSOLUTE_TIME_RANGE is true").toBeDefined();
        expect(END_DATE, "END_DATE must not be empty when ABSOLUTE_TIME_RANGE is true").not.toBe('');
        logger.info("Absolute time range is configured correctly.");
    } else {
        expect(TIME_UNIT, "TIME_UNIT must be set when ABSOLUTE_TIME_RANGE is false").toBeDefined();
        expect(TIME_UNIT, "TIME_UNIT must not be empty when ABSOLUTE_TIME_RANGE is false").not.toBe('');
        expect(TIME_VALUE, "TIME_VALUE must be set when ABSOLUTE_TIME_RANGE is false").toBeDefined();
        expect(TIME_VALUE, "TIME_VALUE must not be empty when ABSOLUTE_TIME_RANGE is false").not.toBe('');
        logger.info("Relative time range is configured correctly.");
    }
});

test("Test data check", async () => {
    logger.info('Checking test data...');
    const doc_count: { apm: number; logs: number; metrics: number } = await getDocCount();
    
    expect(doc_count.apm).not.toBeNull();
    expect(doc_count.apm).toBeGreaterThan(0);
    
    expect(doc_count.logs).not.toBeNull();
    expect(doc_count.logs).toBeGreaterThan(0);
    
    expect(doc_count.metrics).not.toBeNull();
    expect(doc_count.metrics).toBeGreaterThan(0);
    
    logger.info(`Document count: APM: ${doc_count.apm}, Logs: ${doc_count.logs}, Metrics: ${doc_count.metrics}`);
})

test("Reporting cluster check", async () => {
    const indexName = 'oblt-playwright';
    logger.info(`Checking if index '${indexName}' exists...`);
    let indexExists = await checkIndexExists(indexName);
    
    if (indexExists) {
        logger.info(`Index '${indexName}' exists.`);
    } else {
        logger.warn(`Index '${indexName}' does not exist. Checking for index template...`);
        const templateExists = await checkIndexTemplateExists(indexName);
        
        if (templateExists) {
            logger.info(`Index template '${indexName}' exists. Creating index...`);
            await createIndex(indexName);
            indexExists = await checkIndexExists(indexName);
            expect(indexExists).toBeTruthy();
            logger.info(`Index '${indexName}' created successfully.`);
        } else {
            logger.warn(`Index template '${indexName}' does not exist. Creating index template...`);
            await createIndexTemplate(indexName);
            logger.info(`Index template '${indexName}' created successfully. Creating index...`);
            await createIndex(indexName);
            indexExists = await checkIndexExists(indexName);
            expect(indexExists).toBeTruthy();
            logger.info(`Index '${indexName}' created successfully.`);
        }
    }
    expect(indexExists).toBeTruthy();
});
