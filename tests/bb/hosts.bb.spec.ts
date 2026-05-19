import * as fs from 'fs';
import { test } from '../../src/pom/page-fixtures';
import { createNetworkTraceCollector, NetworkTraceCapture } from '../../src/helpers/network-trace';
import { testStep, resolveKibanaTimeRangeRison } from '../../src/helpers/test-utils';
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

// Replaces `dateRange` and `limit` inside the `_a=(...)` segment of a Hosts
// URL, preserving every other field Hosts wrote. Safe assumption: inside the
// `_a=(...)` segment both `dateRange:` and `limit:` appear exactly once, and
// no other query param (currently only `controlPanels=`) contains either
// token. The caller MUST only invoke this once the URL has Hosts' canonical
// `_a=(...)` written; otherwise the regexes are no-ops.
function upsertHostsState(url: string, hostLimit: number, from: string, to: string): string {
  let next: string;
  try {
    next = decodeURIComponent(url);
  } catch {
    next = url;
  }

  const dateRange = `dateRange:(from:${from},to:${to})`;
  if (/dateRange:\(from:[^,]+,to:[^)]+\)/.test(next)) {
    next = next.replace(/dateRange:\(from:[^,]+,to:[^)]+\)/, dateRange);
  } else if (next.includes('_a=(')) {
    next = next.replace('_a=(', `_a=(${dateRange},`);
  }

  if (/limit:\d+/.test(next)) {
    next = next.replace(/limit:\d+/, `limit:${hostLimit}`);
  } else if (next.includes('_a=(')) {
    next = next.replace('_a=(', `_a=(limit:${hostLimit},`);
  }

  return next;
}

function hasDesiredHostsState(url: string, hostLimit: number, from: string, to: string): boolean {
  try {
    const parsed = new URL(url, 'http://placeholder');
    const search = decodeURIComponent(parsed.search);
    return (
      search.includes(`dateRange:(from:${from},to:${to})`) &&
      search.includes(`limit:${hostLimit}`)
    );
  } catch {
    return false;
  }
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

    test.beforeAll('Check data', async ({ log }) => {
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
    const stepDescription = `Opening ${HOSTS_APP_PATH} with host_limit=${HOST_LIMIT} and zoom=${ZOOM} via bootstrap+rewrite; measuring only the desired-state navigation`;

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
          slowRequestCount: 20,
        });

        try {
          await testStep('step01', stepData, page, async () => {
            const { from, to } = resolveKibanaTimeRangeRison();

            log.info(`Resolved Hosts target state: dateRange:(from:${from},to:${to}), limit:${HOST_LIMIT}`);

            // 0) Install zoom hook BEFORE any navigation. `addInitScript`
            //    runs on every new document at the earliest possible moment,
            //    so the page renders at the target zoom from the first paint
            //    rather than re-layouting mid-test. This is important because
            //    lower zoom reveals more visualizations; we want all charts
            //    laid out before measurement starts.
            log.info(`Installing zoom hook (target zoom: ${ZOOM})`);
            await page.addInitScript((z) => {
              const apply = () => {
                if (document.body) {
                  document.body.style.zoom = String(z);
                  return true;
                }
                return false;
              };
              if (apply()) return;
              const obs = new MutationObserver(() => {
                if (apply()) obs.disconnect();
              });
              obs.observe(document.documentElement, { childList: true, subtree: false });
            }, ZOOM);

            // 1) Bootstrap navigation. Not measured. Lets Hosts hydrate to
            //    its canonical URL shape so we can read every field it
            //    expects in `_a` without baking field names into this code.
            log.info(`Bootstrapping ${HOSTS_APP_PATH} (warm-up; not measured)`);
            await page.goto(HOSTS_APP_PATH);
            const loadingIndicator = page.locator('[data-test-subj="globalLoadingIndicator"]');
            await loadingIndicator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
            await loadingIndicator.waitFor({ state: 'hidden', timeout: 180000 });

            // 2) Wait for the full-state marker. `controlPanels=` is the
            //    last thing Hosts writes during init; when present alongside
            //    `_a=(`, the URL has Hosts' complete canonical state and
            //    `upsertHostsState` will produce a real rewrite (not a no-op).
            log.info('Waiting for Hosts to write its canonical state to the URL');
            await page.waitForFunction(
              () => /[?&]controlPanels=/.test(location.search) && /[?&]_a=\(/.test(location.search),
              null,
              { timeout: 60_000 }
            );
            const bootstrapUrl = page.url();
            log.info(`Hosts canonical URL captured: ${bootstrapUrl}`);

            // 3) Upsert desired dateRange/limit, preserving every other field
            //    Hosts wrote. The result still looks "complete" to Hosts, so
            //    it accepts our values instead of replacing them with the
            //    persisted default state.
            const desiredUrl = upsertHostsState(bootstrapUrl, HOST_LIMIT, from, to);
            log.info(`Desired URL with scenario state: ${desiredUrl}`);

            // Small local helpers shared between the warm-up and measured
            // navigations so both paths behave identically.
            const navigateAndConfirmDesiredState = async () => {
              await page.goto(desiredUrl);
              await loadingIndicator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
              await loadingIndicator.waitFor({ state: 'hidden', timeout: 180000 });

              await page.waitForFunction(
                ({ from, to, limit }) => {
                  let search = '';
                  try { search = decodeURIComponent(location.search); } catch { search = location.search; }
                  return search.includes(`dateRange:(from:${from},to:${to})`)
                    && search.includes(`limit:${limit}`);
                },
                { from, to, limit: HOST_LIMIT },
                { timeout: 30_000 }
              );

              const settledUrl = page.url();
              if (!hasDesiredHostsState(settledUrl, HOST_LIMIT, from, to)) {
                throw new Error(`Hosts URL state drifted from desired. Final URL: ${settledUrl}`);
              }
              return settledUrl;
            };

            const waitForHostsFullyRendered = async () => {
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
            };

            // 4) WARM-UP NAVIGATION — NOT measured.
            //
            // Why this exists:
            //   The bootstrap above warms only the Hosts shell at *default*
            //   state (limit:100, now-15m). The scenario state (e.g.
            //   limit:500, now-30m) is strictly broader: more rows trigger
            //   additional Lens chart chunks, wider time ranges pull more
            //   data, and certain Kibana internal endpoints (security/me,
            //   ml_capabilities, infra/host, ...) pay a one-time
            //   cold-cache cost on first call after a Kibana restart.
            //
            //   If we measured the FIRST scenario-state navigation, those
            //   one-time costs would land inside the measurement window
            //   and dominate the captured numbers, masking the real
            //   per-scenario render cost we're trying to compare. The same
            //   problem would also make consecutive runs of the same
            //   scenario diverge wildly depending on whether the chunks /
            //   internal caches happened to be warm from a previous run.
            //
            //   By performing a throwaway navigation to the scenario URL
            //   first and waiting for every visibility assertion to pass,
            //   we guarantee that by the time we measure: (a) every JS
            //   chunk the scenario state needs is parsed and in V8's code
            //   cache, (b) every cold Kibana endpoint has been hit at
            //   least once, and (c) the Hosts URL container is fully
            //   hydrated. The measured navigation then reflects the
            //   actual per-scenario cost on a fully-warm Kibana session,
            //   which matches the experience of a returning user — the
            //   population this benchmark is intended to model.
            log.info('Warm-up navigation to desired URL (NOT measured)');
            await navigateAndConfirmDesiredState();
            await waitForHostsFullyRendered();
            log.info('Warm-up complete; Hosts fully rendered. Starting measurement.');

            // 5) MEASURED navigation. perfMetrics baseline + network trace
            //    start HERE so the captured metrics reflect ONLY the cost
            //    of re-rendering Hosts on a fully-warm Kibana. `page.goto`
            //    to the same URL forces a real navigation (no bfcache /
            //    same-document optimisation), so we are still measuring a
            //    full page load — just one served from warm caches/state.
            await perfMetrics.takeBaseline();
            await networkTraceCollector.start();
            traceCollectionStarted = true;

            const finalUrl = await navigateAndConfirmDesiredState();
            log.info(`Hosts URL stabilized with desired state: ${finalUrl}`);

            log.info('Asserting visibility of elements on the Hosts page');
            await waitForHostsFullyRendered();

            log.info('Step 1 settled, collecting full performance metrics');
            const collectedPerfMetrics = await perfMetrics.collect();
            networkTrace = await networkTraceCollector.collect();
            traceCollectionStarted = false;

            perfData = {
              ...collectedPerfMetrics,
              networkTraceId: networkTrace.traceId,
              networkSummary: networkTrace.summary,
              slowestRequests: networkTrace.slowestRequests,
              slowestApiRequests: networkTrace.slowestApiRequests,
              slowestStaticRequests: networkTrace.slowestStaticRequests,
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
