import { test, expect } from "@playwright/test";
import { getDocCount, fetchClusterData, checkKibanaAvailability } from "../src/helpers.ts";
import { logger } from "../src/logger.ts";

test("Environment check", async ({ page }) => {
    logger.info("Checking Elasticsearch availability...");
    const clusterData: any = await fetchClusterData();
    expect(clusterData).toBeDefined();
    expect(clusterData.cluster_name).toBeDefined();
    expect(clusterData.version).toBeDefined();
    logger.info(`Elasticsearch is available. Cluster: ${clusterData.cluster_name}`);
    
    logger.info("Checking Kibana availability...");
    const kibanaStatus: any = await checkKibanaAvailability(page);
    expect(kibanaStatus.available).toBe(true);
    expect(kibanaStatus.status).toBe(200);
    logger.info(`Kibana is available at ${kibanaStatus.url}`);
})

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