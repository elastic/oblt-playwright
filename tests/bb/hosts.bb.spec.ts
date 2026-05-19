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

// Each scenario runs the measured navigation three times to expose both
// cold-cache cost (first hit) and warmed steady-state cost (subsequent hits).
// The bootstrap navigation is shared across all three and is NOT counted as
// an iteration; it only exists to read Hosts' canonical URL shape.
type IterationDescriptor = {
  label: 'cold' | 'warm1' | 'warm2';
  step: 'step01' | 'step02' | 'step03';
};
const ITERATIONS: IterationDescriptor[] = [
  { label: 'cold', step: 'step01' },
  { label: 'warm1', step: 'step02' },
  { label: 'warm2', step: 'step03' },
];

type IterationResult = {
  label: IterationDescriptor['label'];
  perfData: object;
  networkTrace: NetworkTraceCapture;
};

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
      const stepData = (testInfo as any).stepData;
      const iterations = (testInfo as any).iterations as IterationResult[] | undefined;

      if (Array.isArray(iterations) && iterations.length > 0) {
        // Per-iteration reports: one JSON + one network-trace file per
        // iteration, suffixed and title-tagged so cold/warm1/warm2 are
        // distinguishable both on disk and in the printed console output.
        for (const iteration of iterations) {
          const fileNameSuffix = `_${iteration.label}`;
          const titleSuffix = ` [${iteration.label}]`;
          const reportFiles = await writeJsonReport(
            log, clusterData, testInfo, testStartTime, doc_count,
            stepData, undefined, iteration.perfData,
            { fileNameSuffix, titleSuffix },
          );
          if (iteration.networkTrace) {
            await writeNetworkTraceReport(
              log, clusterData, testInfo, testStartTime, iteration.networkTrace,
              iteration.perfData,
              { fileNameSuffix, titleSuffix },
            );
          }
          reports.push(...reportFiles.filter(item => typeof item === 'string'));
        }
      } else {
        // Fallback path for partial runs (e.g. test failed before any
        // iteration completed): still emit a report with whatever stepData
        // was captured so the failure is recorded.
        const reportFiles = await writeJsonReport(
          log, clusterData, testInfo, testStartTime, doc_count, stepData,
        );
        reports.push(...reportFiles.filter(item => typeof item === 'string'));
      }
    });

    test.afterAll('Print test results', async ({}) => {
      await printResults(reports);
    });

    const testName = `Hosts - ${scenario.name}`;
    const stepDescription = `Opening ${HOSTS_APP_PATH} with host_limit=${HOST_LIMIT} and zoom=${ZOOM}: bootstrap + 3 measured iterations (cold, warm1, warm2)`;

    test(testName,
      async ({ headerBar, hostsPage, notifications, perfMetrics, page, log }, testInfo) => {
        const cpuUsageKPI = "infraAssetDetailsKPIcpuUsage";
        const normalizedLoadKPI = "infraAssetDetailsKPInormalizedLoad1m";
        const memoryUsageKPI = "infraAssetDetailsKPImemoryUsage";
        const diskUsageKPI = "infraAssetDetailsKPIdiskUsage";
        const cpuUsage = "hostsView-metricChart-cpuUsage";
        const normalizedLoad = "hostsView-metricChart-normalizedLoad1m";

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

          // 1) Bootstrap navigation. Not an iteration, not measured. Its
          //    only purpose is to let Hosts hydrate to its canonical URL
          //    shape so we can read every field it expects in `_a` without
          //    baking field names into this code. The first scenario-state
          //    navigation that follows is treated as the COLD measurement.
          log.info(`Bootstrapping ${HOSTS_APP_PATH} (URL-state setup; not measured)`);
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

          // Helpers shared by every measured iteration so each navigation
          // resolves the same way and any drift in URL state is caught
          // before metrics are collected.
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

          // 4) MEASURED iterations.
          //
          // The first iteration (`cold`) is the very first time the page
          // is loaded with the scenario state, so it includes the one-time
          // cold-cache cost: extra Lens chart chunks parsed by V8, cold
          // Kibana endpoints (security/me, ml_capabilities, infra/host,
          // ...) hit for the first time at this scenario, and any disk-
          // cacheable static assets fetched from network.
          //
          // The two warm iterations (`warm1`, `warm2`) navigate to the
          // exact same URL with the same `page.goto`, so each is a full
          // page load (no bfcache / same-document optimisation), but
          // served from a fully-warmed Kibana session. Comparing cold
          // vs warm reveals how much of the observed cost is one-time
          // bootstrap versus per-render work.
          for (const iteration of ITERATIONS) {
            await testStep(iteration.step, stepData, page, async () => {
              log.info(`Iteration "${iteration.label}": taking perf baseline and starting network trace`);
              await perfMetrics.takeBaseline();
              await networkTraceCollector.start();
              traceCollectionStarted = true;

              log.info(`Iteration "${iteration.label}": navigating to desired URL`);
              const finalUrl = await navigateAndConfirmDesiredState();
              log.info(`Iteration "${iteration.label}": URL stabilized: ${finalUrl}`);

              log.info(`Iteration "${iteration.label}": asserting visibility of elements on the Hosts page`);
              await waitForHostsFullyRendered();

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
            }, `Hosts ${iteration.label} measurement: navigate to desired URL and collect perf + network trace`);
          }
        } finally {
          if (traceCollectionStarted) {
            try {
              // Best-effort drain: an iteration started a capture but
              // crashed before collect(). Discard the partial result so
              // the CDP session is left in a clean state for dispose().
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
