import * as fs from 'fs';
import { test } from 'oblt-playwright/fixtures/page-fixtures';
import { createNetworkTraceCollector } from '../../src/helpers/network-trace';
import { perfStep, buildKibanaUrl, resolveKibanaTimeRangeRison } from '../../src/helpers/test-utils';
import { fetchClusterData, getDocCount, listDataViews } from '../../src/helpers/api-client';
import { printResults } from '../../src/helpers/reporter';
import { ITERATIONS, IterationResult, writeIterationReports } from '../../src/helpers/bb-iterations';

interface Scenario {
  name: string;
  section: string;
  url: string;
  data_view?: string;
}

function loadScenarios(): Scenario[] {
  const filePath = process.env.BB_SCENARIOS_FILE;
  if (!filePath) {
    throw new Error('BB_SCENARIOS_FILE environment variable is not set');
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const all: Scenario[] = JSON.parse(raw);
  return all.filter(s => (s.section || 'discover').toLowerCase() === 'discover');
}

function normalizeTarget(target: string): string {
  const t = target.trim();
  return t.startsWith('_a=') ? t.slice(3) : t;
}

function getUrlEmbeddedAppState(targetUrl: string): { appPath: string; appState?: string } {
  const u = targetUrl.trim();
  const seg = '/_a=';
  const segIdx = u.indexOf(seg);
  if (segIdx !== -1) {
    return { appPath: u.slice(0, segIdx), appState: u.slice(segIdx + seg.length) };
  }

  const aIdx = u.indexOf('_a=');
  if (aIdx !== -1) {
    const appPath = u.split('#')[0].split('?')[0];
    const rest = u.slice(aIdx + 3);
    const end = rest.indexOf('&');
    const appState = end === -1 ? rest : rest.slice(0, end);
    return { appPath, appState };
  }

  return { appPath: u };
}

function hasDesiredDiscoverState(url: string, from: string, to: string, expectedDataViewId?: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    decoded = url;
  }

  if (!decoded.includes('_a=')) {
    return false;
  }

  // Kibana writes relative bounds like `now-1d` unquoted in rison, while
  // `resolveKibanaTimeRangeRison` quotes any configured date, so compare
  // without quotes.
  const unquoted = decoded.replace(/'/g, '');
  if (!unquoted.includes(`time:(from:${from.replace(/'/g, '')},to:${to.replace(/'/g, '')})`)) {
    return false;
  }
  if (!expectedDataViewId) {
    return true;
  }

  // Kibana rewrites the legacy `index:'<id>'` into `dataSource:(dataViewId:'<id>',...)`,
  // so match the id itself rather than a specific serialization.
  return decoded.includes(expectedDataViewId);
}

const scenarios = loadScenarios();

for (const scenario of scenarios) {
  test.describe(`Discover - ${scenario.data_view || scenario.name}`, () => {
    let clusterData: any;
    let doc_count: object;
    let reports: string[] = [];
    let dataViewId: string | undefined;
    const testStartTime: string = new Date().toISOString();

    const KIBANA_APP_PATH = scenario.url;
    const DATA_VIEW_TITLE = scenario.data_view?.trim() || undefined;

    test.beforeAll('Fetch cluster data and resolve Discover target', async ({ request, log }) => {
      log.info('Fetching cluster data');
      clusterData = await fetchClusterData();
      log.info('Checking test data...');
      doc_count = await getDocCount();

      const { appState } = getUrlEmbeddedAppState(KIBANA_APP_PATH);
      test.skip(!DATA_VIEW_TITLE && !appState, 'Test is skipped: neither data_view nor url-embedded _a target is configured');

      if (DATA_VIEW_TITLE) {
        log.info(`Resolving the "${DATA_VIEW_TITLE}" data view id`);
        const dataViews = await listDataViews(request);
        const dataView = dataViews.find((view: any) =>
          view?.title === DATA_VIEW_TITLE || view?.name === DATA_VIEW_TITLE
        );
        test.skip(!dataView?.id, `Test is skipped: "${DATA_VIEW_TITLE}" data view is not available`);
        dataViewId = dataView.id;
      }
    });

    test.afterEach('Log test results', async ({ log }, testInfo) => {
      reports.push(...await writeIterationReports(
        log, clusterData, testInfo, testStartTime, doc_count,
        (testInfo as any).stepData,
        (testInfo as any).iterations as IterationResult[] | undefined,
      ));
    });

    test.afterAll('Print test results', async ({}) => {
      await printResults(reports);
    });

    const testName = DATA_VIEW_TITLE
      ? `Discover - ${DATA_VIEW_TITLE}`
      : `Discover - ${scenario.name}`;

    const logNavigate = DATA_VIEW_TITLE
      ? `Navigating directly to ${KIBANA_APP_PATH} via data view id: ${dataViewId}`
      : `Navigating directly to ${KIBANA_APP_PATH} via url-embedded _a target`;

    const stepDescription = (label: string) => DATA_VIEW_TITLE
      ? `Discover ${label} measurement: open ${KIBANA_APP_PATH} with ${DATA_VIEW_TITLE} data view id and collect perf + network trace`
      : `Discover ${label} measurement: open ${KIBANA_APP_PATH} with url-embedded _a target and collect perf + network trace`;

    test(testName,
      async ({ discoverPage, headerBar, notifications, perfMetrics, page, log }, testInfo) => {
        let stepData: object[] = [];
        const iterations: IterationResult[] = [];
        let traceCollectionStarted = false;
        (testInfo as any).stepData = stepData;
        (testInfo as any).iterations = iterations;

        const networkTraceCollector = await createNetworkTraceCollector(page, log, {
          maxNetworkRequests: 2000,
          slowRequestCount: 20,
        });

        try {
          let appState: string;
          const { appPath, appState: urlAppState } = getUrlEmbeddedAppState(KIBANA_APP_PATH);
          if (DATA_VIEW_TITLE) {
            if (!dataViewId) {
              throw new Error(`Data view id was not resolved for data_view "${DATA_VIEW_TITLE}"`);
            }
            appState = `(index:'${dataViewId}')`;
          } else if (urlAppState) {
            appState = normalizeTarget(urlAppState);
          } else {
            throw new Error('Neither DATA_VIEW_TITLE nor a url-embedded _a target are configured');
          }

          const { from, to } = resolveKibanaTimeRangeRison();
          const kibanaUrl = buildKibanaUrl(appPath, appState);
          const loadingIndicator = page.locator('[data-test-subj="globalLoadingIndicator"]');

          const navigateToDiscover = async () => {
            await page.goto(kibanaUrl);
            await loadingIndicator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
            await loadingIndicator.waitFor({ state: 'hidden', timeout: 180000 });
          };

          // The page counts as rendered once the result is shown and the loading
          // indicator is gone; the indicator alone can hide before the result.
          const waitForDiscoverRendered = async () => {
            await Promise.race([
              DATA_VIEW_TITLE
                ? discoverPage.assertVisibilityDataGridRow()
                : discoverPage.assertVisibilityTotalDocumentsProcessed(),
              notifications.assertErrorFetchingResource().then(() => {
                throw new Error('Error while fetching resource');
              }),
              notifications.assertErrorIncrementCount().then(() => {
                throw new Error(`Error loading data in index logs-*. already closed, can't increment ref count`);
              }),
              discoverPage.assertHistogramEmbeddedError().then(() => {
                throw new Error('Chart failed to load');
              }),
              discoverPage.assertDiscoverNoResults().then(() => {
                throw new Error('Discover shows no results');
              }),
            ]);
            if (DATA_VIEW_TITLE) {
              await discoverPage.assertSearchSettled();
              await headerBar.assertLoadingIndicator();
              await discoverPage.assertVisibilityCanvas();
            } else {
              await headerBar.assertLoadingIndicator();
            }
          };

          // MEASURED iterations. `cold` is the first load of the target URL
          // in this browser session, so it includes one-time costs. `warm1`
          // and `warm2` are full page loads of the same URL on a warmed
          // session, so cold vs warm shows how much of the cost is one-time.
          for (const iteration of ITERATIONS) {
            // Discover keeps its state in the URL hash, and a navigation to a
            // URL that differs from the current one only by the hash does not
            // reload the page. Leaving the app first makes the measured
            // `goto` a real load.
            await page.goto('about:blank');
            await perfStep(iteration.step, stepData, page, async () => {
              log.info(`Iteration "${iteration.label}": taking perf baseline and starting network trace`);
              await perfMetrics.takeBaseline();
              await networkTraceCollector.start();
              traceCollectionStarted = true;

              log.info(`Iteration "${iteration.label}": ${logNavigate}`);
              await navigateToDiscover();

              log.info(`Iteration "${iteration.label}": asserting Discover has rendered`);
              await waitForDiscoverRendered();

              const finalUrl = page.url();
              if (!hasDesiredDiscoverState(finalUrl, from, to, dataViewId)) {
                throw new Error(`Discover URL did not contain expected app state. Final URL: ${finalUrl}`);
              }

              log.info(`Iteration "${iteration.label}": settled, collecting full performance metrics`);
              const collectedPerfMetrics = await perfMetrics.collect();
              const networkTrace = await networkTraceCollector.collect();
              traceCollectionStarted = false;

              const perfData = {
                iteration: iteration.label,
                ...collectedPerfMetrics,
                networkTraceId: networkTrace.traceId,
                networkSummary: networkTrace.summary,
                slowestRequests: networkTrace.slowestRequests,
                slowestApiRequests: networkTrace.slowestApiRequests,
                slowestStaticRequests: networkTrace.slowestStaticRequests,
              };
              iterations.push({ label: iteration.label, perfData, networkTrace });
            }, stepDescription(iteration.label));
          }
        } finally {
          if (traceCollectionStarted) {
            try {
              await networkTraceCollector.collect();
            } catch (error: any) {
              log.warn(`Network trace collection could not be completed: ${error.message}`);
            }
          }
          await networkTraceCollector.dispose();
        }
      });
  });
}
