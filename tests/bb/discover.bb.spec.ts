import * as fs from 'fs';
import { test } from '../../src/pom/page-fixtures';
import { testStep, buildKibanaUrl } from '../../src/helpers/test-utils';
import { fetchClusterData, getDocCount, listDataViews } from '../../src/helpers/api-client';
import { writeJsonReport, printResults } from '../../src/helpers/reporter';

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
      const perfData = (testInfo as any).perfData;
      const stepData = (testInfo as any).stepData;
      const reportFiles = await writeJsonReport(
        log, clusterData, testInfo, testStartTime, doc_count,
        stepData, undefined, perfData
      );
      reports.push(...reportFiles.filter(item => typeof item === 'string'));
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

    const stepDescription = DATA_VIEW_TITLE
      ? `Opening ${KIBANA_APP_PATH} with ${DATA_VIEW_TITLE} data view id and collecting full navigation metrics`
      : `Opening ${KIBANA_APP_PATH} with url-embedded _a target and collecting full navigation metrics`;

    test(testName,
      async ({ discoverPage, headerBar, notifications, perfMetrics, page, log }, testInfo) => {
        let stepData: object[] = [];
        let perfData: object | null = null;
        (testInfo as any).stepData = stepData;
        (testInfo as any).perfData = perfData;

        await testStep('step01', stepData, page, async () => {
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

          const kibanaUrl = buildKibanaUrl(appPath, appState);
          log.info(logNavigate);
          await page.goto(kibanaUrl);

          await perfMetrics.takeBaseline();
          const loadingIndicator = page.locator('[data-test-subj="globalLoadingIndicator"]');
          await loadingIndicator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
          await loadingIndicator.waitFor({ state: 'hidden', timeout: 180000 });

          log.info('Asserting visibility of the chart canvas and data grid row');
          await Promise.race([
            discoverPage.assertVisibilityDataGridRow(),
            notifications.assertErrorFetchingResource().then(() => {
              throw new Error('Test is failed: Error while fetching resource');
            }),
            notifications.assertErrorIncrementCount().then(() => {
              throw new Error(`Test is failed: Error loading data in index logs-*. already closed, can't increment ref count`);
            }),
            discoverPage.assertHistogramEmbeddedError().then(() => {
              throw new Error('Test is failed: Chart failed to load');
            }),
            discoverPage.assertDiscoverNoResults().then(() => {
              throw new Error('Test is failed: Discover shows no results');
            }),
          ]);

          log.info('Step 1 settled, collecting full performance metrics');
          perfData = await perfMetrics.collect();
          (testInfo as any).perfData = perfData;
        }, stepDescription);
      });
  });
}
