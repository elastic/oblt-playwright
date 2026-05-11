import * as fs from 'fs';
import { test } from '../../src/pom/page-fixtures';
import { createNetworkTraceCollector, NetworkTraceCapture } from '../../src/helpers/network-trace';
import { testStep, buildKibanaUrl } from '../../src/helpers/test-utils';
import { fetchClusterData, getDocCount, getHostData } from '../../src/helpers/api-client';
import { writeJsonReport, writeNetworkTraceReport, printResults } from '../../src/helpers/reporter';

interface Scenario {
  name: string;
  section: string;
  host_limit: number;
  zoom: number;
}

function loadScenarios(): Scenario[] {
  const filePath = process.env.BB_SCENARIOS_FILE;
  if (!filePath) {
    throw new Error('BB_SCENARIOS_FILE environment variable is not set');
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const all: Scenario[] = JSON.parse(raw);
  return all.filter(s => (s.section || '').toLowerCase() === 'hosts');
}

const HOSTS_APP_PATH = '/app/metrics/hosts';
const scenarios = loadScenarios();

for (const scenario of scenarios) {
  test.describe(`Hosts - ${scenario.name}`, () => {
    let clusterData: any;
    let doc_count: object;
    let reports: string[] = [];
    const testStartTime: string = new Date().toISOString();

    const HOST_LIMIT = scenario.host_limit;
    const ZOOM = scenario.zoom;

    test.beforeAll('Check data', async ({ request, log }) => {
      log.info('Checking if host data is available in the last 24 hours');
      const nodesData = await getHostData(request);
      const nodesArr = nodesData.nodes;
      const metricValue = nodesData.nodes[0]?.metrics?.[0]?.value;
      test.skip(nodesArr.length == 0 || metricValue == null, 'Test is skipped: No node data is available');
      log.info('Fetching cluster data');
      clusterData = await fetchClusterData();
      doc_count = await getDocCount();
    });

    test.afterEach('Log test results', async ({ log }, testInfo) => {
      const perfData = (testInfo as any).perfData;
      const networkTrace = (testInfo as any).networkTrace as NetworkTraceCapture | null | undefined;
      const stepData = (testInfo as any).stepData;
      const reportFiles = await writeJsonReport(
        log, clusterData, testInfo, testStartTime, doc_count,
        stepData, undefined, perfData
      );
      if (networkTrace) {
        await writeNetworkTraceReport(log, clusterData, testInfo, testStartTime, networkTrace, perfData ?? undefined);
      }
      reports.push(...reportFiles.filter(item => typeof item === 'string'));
    });

    test.afterAll('Print test results', async ({}) => {
      await printResults(reports);
    });

    const testName = `Hosts - ${scenario.name}`;
    const stepDescription = `Opening ${HOSTS_APP_PATH} with host_limit=${HOST_LIMIT} and zoom=${ZOOM} and collecting full navigation metrics`;

    test(testName,
      async ({ headerBar, hostsPage, notifications, perfMetrics, page, log }, testInfo) => {
        const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
        const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
        const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
        const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
        const cpuUsage = "hostsView-metricChart-cpuUsage";
        const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";

        let stepData: object[] = [];
        let perfData: object | null = null;
        let networkTrace: NetworkTraceCapture | null = null;
        let traceCollectionStarted = false;
        (testInfo as any).stepData = stepData;
        (testInfo as any).perfData = perfData;
        (testInfo as any).networkTrace = networkTrace;

        const networkTraceCollector = await createNetworkTraceCollector(page, log, {
          maxNetworkRequests: 2000,
          slowRequestCount: 5,
        });

        try {
          await testStep('step01', stepData, page, async () => {
            const appState = `(limit:${HOST_LIMIT})`;
            const kibanaUrl = buildKibanaUrl(HOSTS_APP_PATH, appState);
            log.info(`Navigating directly to ${HOSTS_APP_PATH} with host_limit=${HOST_LIMIT}`);
            await perfMetrics.takeBaseline();
            await networkTraceCollector.start();
            traceCollectionStarted = true;
            await page.goto(kibanaUrl);
            const loadingIndicator = page.locator('[data-test-subj="globalLoadingIndicator"]');
            await loadingIndicator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
            await loadingIndicator.waitFor({ state: 'hidden', timeout: 180000 });

            log.info(`Setting page zoom to ${ZOOM}`);
            await page.evaluate((z) => { document.body.style.zoom = String(z); }, ZOOM);

            log.info('Asserting visibility of elements on the Hosts page');
            await Promise.race([
              Promise.all([
                hostsPage.assertHostsNumber(),
                hostsPage.assertVisibilityHostsTable(),
                hostsPage.assertVisibilityVisualization(cpuUsageKPI),
                hostsPage.assertVisibilityVisualization(normalizedLoadKPI),
                hostsPage.assertVisibilityVisualization(memoryUsageKPI),
                hostsPage.assertVisibilityVisualization(diskUsageKPI),
                hostsPage.assertVisibilityVisualization(cpuUsage),
                hostsPage.assertVisibilityVisualization(normalizedLoad),
                headerBar.assertLoadingIndicator(),
              ]),
              hostsPage.assertVisualizationNoData(cpuUsageKPI).then(() => {
                throw new Error('Test is failed because no visualization data available');
              }),
              hostsPage.assertVisualizationNoData(normalizedLoadKPI).then(() => {
                throw new Error('Test is failed because no visualization data available');
              }),
              hostsPage.assertVisualizationNoData(memoryUsageKPI).then(() => {
                throw new Error('Test is failed because no visualization data available');
              }),
              hostsPage.assertVisualizationNoData(diskUsageKPI).then(() => {
                throw new Error('Test is failed because no visualization data available');
              }),
              notifications.assertErrorFetchingResource().then(() => {
                throw new Error('Test is failed because Hosts data failed to load');
              })
            ]);

            log.info('Step 1 settled, collecting full performance metrics');
            const collectedPerfMetrics = await perfMetrics.collect();
            networkTrace = await networkTraceCollector.collect();
            traceCollectionStarted = false;

            perfData = {
              ...collectedPerfMetrics,
              networkTraceId: networkTrace.traceId,
              networkSummary: networkTrace.summary,
              slowestRequests: networkTrace.slowestRequests,
            };
            (testInfo as any).perfData = perfData;
            (testInfo as any).networkTrace = networkTrace;
          }, stepDescription);
        } finally {
          if (traceCollectionStarted && !networkTrace) {
            try {
              networkTrace = await networkTraceCollector.collect();
              (testInfo as any).networkTrace = networkTrace;
            } catch (error: any) {
              log.warn(`Network trace collection could not be completed: ${error.message}`);
            }
          }
          await networkTraceCollector.dispose();
        }
      });
  });
}
