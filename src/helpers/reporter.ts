import { TestInfo } from '@playwright/test';
import {
  ABSOLUTE_TIME_RANGE,
  CI,
  END_DATE,
  START_DATE,
  TIME_UNIT,
  TIME_VALUE,
  REPORT_DIR,
} from '../env.ts';
import * as fs from 'fs';
import * as path from 'path';
import { Table } from 'console-table-printer';
import { Logger } from "winston";
import { NetworkTraceCapture } from './network-trace';

const outputDirectory = CI === 'true' ? '/home/runner/work/oblt-playwright/' : REPORT_DIR;

function ensureOutputDirectory() {
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }
}

function buildReportFileBase(testStartTime: string, testTitle: string): string {
  return `${new Date(testStartTime).toISOString().replace(/:/g, '_')}_${testTitle.replace(/\s/g, "_").toLowerCase()}`;
}

function buildPeriodLabel() {
  return ABSOLUTE_TIME_RANGE
    ? `From ${START_DATE} to ${END_DATE}`
    : `Last ${TIME_VALUE} ${TIME_UNIT}`;
}

function stripAnsi(value: string | undefined): string {
  if (!value) {
    return '';
  }

  return value.replace(/\u001b\[[0-9;]*m|\u001b/g, '');
}

// Strips the origin (scheme + host + optional port) from a URL so the report
// shows just `/path?query`. Host-agnostic — works for any cluster, not just
// localhost. Falls back to the raw URL if it isn't parseable.
function stripUrlOrigin(url: string | undefined): string {
  if (!url) {
    return '';
  }
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

// Cap on rows rendered into the console-friendly slowest-requests table.
// The JSON report keeps a wider list (see `slowRequestCount` at the collector
// call site) for offline drill-down; the console view stays compact so it
// doesn't drown out the rest of the per-test summary.
const PRINTED_SLOWEST_REQUESTS = 5;

// Renders a slowest-requests table with Type and Cache columns. The Cache
// column shows `disk` for `fromDiskCache: true` so a reader can immediately
// see whether a fast/slow result is explained by cache state rather than
// real backend behaviour. Skips silently if there are no rows.
function printSlowestRequestsTable(title: string, requests: any[] | undefined) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return;
  }
  const table = new Table({
    title,
    columns: [
      { name: 'method', title: 'Method', color: 'yellow' },
      { name: 'status', title: 'Status' },
      { name: 'type', title: 'Type' },
      { name: 'cache', title: 'Cache' },
      { name: 'duration', title: 'Duration', color: 'green' },
      { name: 'url', title: 'URL', maxLen: 80 },
    ],
  });
  table.addRows(
    requests.slice(0, PRINTED_SLOWEST_REQUESTS).map((request: any) => ({
      method: request.method,
      status: request.status ?? 'N/A',
      type: request.resourceType ?? 'N/A',
      cache: request.fromDiskCache ? 'disk' : '',
      duration: request.durationMs != null ? `${request.durationMs} ms` : 'N/A',
      url: stripUrlOrigin(request.url),
    })),
    { separator: true },
  );
  table.printTable();
}

export async function writeJsonReport(
  log: Logger,
  clusterData: any,
  testInfo: TestInfo,
  testStartTime: string,
  docsCount?: object,
  stepData?: object[],
  cacheStats?: object,
  perfMetrics?: object,
) {
  let build_flavor: any = clusterData.version.build_flavor;
  let cluster_name: any = clusterData.cluster_name;
  let files: string[] = [];

  const fileName = `${buildReportFileBase(testStartTime, testInfo.title)}.json`;
  files.push(fileName);

  ensureOutputDirectory();
  log.info(`Saving report file to ${outputDirectory}`);
  const outputPath = path.join(outputDirectory, fileName);

  const reportData = {
    title: testInfo.title,
    startTime: testStartTime,
    doc_count: docsCount,
    period: buildPeriodLabel(),
    status: testInfo.status,
    duration: testInfo.duration,
    ...(testInfo.errors.length > 0 && { errors: { message: testInfo.errors.map((error) => stripAnsi(error.message)).join('\n') } }),
    cluster_name: cluster_name,
    build_flavor: build_flavor,
    steps: stepData ? stepData : null,
    ...(cacheStats && { cacheStats }),
    ...(perfMetrics && { performanceMetrics: perfMetrics }),
  };
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
  return files;
}

export async function writeNetworkTraceReport(
  log: Logger,
  clusterData: any,
  testInfo: TestInfo,
  testStartTime: string,
  networkTrace: NetworkTraceCapture,
  perfMetrics?: object,
) {
  ensureOutputDirectory();

  const fileName = `${buildReportFileBase(testStartTime, testInfo.title)}.network-trace.json`;
  const outputPath = path.join(outputDirectory, fileName);

  const traceReportData = {
    title: testInfo.title,
    startTime: testStartTime,
    period: buildPeriodLabel(),
    status: testInfo.status,
    duration: testInfo.duration,
    ...(testInfo.errors.length > 0 && { errors: { message: testInfo.errors.map((error) => stripAnsi(error.message)).join('\n') } }),
    cluster_name: clusterData.cluster_name,
    build_flavor: clusterData.version.build_flavor,
    networkTraceId: networkTrace.traceId,
    performanceMetrics: perfMetrics,
    networkSummary: networkTrace.summary,
    slowestRequests: networkTrace.slowestRequests,
    captureStartedAt: networkTrace.captureStartedAt,
    captureEndedAt: networkTrace.captureEndedAt,
    maxNetworkRequests: networkTrace.maxNetworkRequests,
  };

  log.info(`Saving network trace file to ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(traceReportData, null, 2));
  return fileName;
}

export async function printResults(reportFiles: string[]) {
  try {
    reportFiles.forEach(file => {
      const filePath = path.join(outputDirectory, file);

      try {
        if (!fs.existsSync(filePath)) {
          console.error(`Test reports not found at '${filePath}'.`);
          return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        console.log(`\n\n`);

        const p = new Table({
          title: `[${jsonData.build_flavor}] ${jsonData.title} @ ${jsonData.period}`,
          columns: [
            { name: 'step', title: 'Step', color: "yellow" },
            { name: 'description', title: 'Description', maxLen: 50 },
            { name: 'start', title: 'Start' },
            { name: 'end', title: 'End' },
            { name: 'duration', title: 'Duration', color: "green" },
          ],
        });

        const data: any[] = [];

        if (Array.isArray(jsonData.steps) && jsonData.steps.length > 0) {
          jsonData.steps.forEach((stepObj: { [key: string]: any }) => {
            const stepName = Object.keys(stepObj)[0];
            const stepDetails = stepObj[stepName];

            if (stepDetails.status === 'passed') {
              const stepRow = {
                step: stepName,
                description: stepDetails.description || 'N/A',
                start: stepDetails.start ? new Date(stepDetails.start).toISOString() : 'N/A',
                end: stepDetails.end ? new Date(stepDetails.end).toISOString() : 'N/A',
                duration: stepDetails.duration ? `${Math.round(stepDetails.duration)} ms` : 'N/A',
              };
              data.push(stepRow);
            }
          });
        }

        if (data.length === 0) {
          data.push({ step: 'No passed steps found' });
        }

        p.addRows(data, { separator: true });
        p.printTable();

        if (jsonData.performanceMetrics) {
          const pm = jsonData.performanceMetrics;
          const perfTable = new Table({
            title: `Performance Metrics`,
            columns: [
              { name: 'metric', title: 'Metric', color: "yellow" },
              { name: 'value', title: 'Value', color: "green" },
            ],
          });

          const ms = (v: any) => v != null ? `${v} ms` : 'N/A';
          perfTable.addRows([
            { metric: 'LCP (Largest Contentful Paint)', value: ms(pm.lcpMs) },
            { metric: 'FCP (First Contentful Paint)', value: ms(pm.fcpMs) },
            { metric: 'TTFB (Time to First Byte)', value: ms(pm.ttfbMs) },
            { metric: 'DOM Content Loaded', value: ms(pm.domContentLoadedMs) },
            { metric: 'Page Load', value: ms(pm.loadMs) },
            { metric: 'Script Duration', value: ms(pm.scriptDurationMs) },
            { metric: 'Layout Duration', value: ms(pm.layoutDurationMs) },
            { metric: 'Recalc Style Duration', value: ms(pm.recalcStyleDurationMs) },
            { metric: 'Task Duration', value: ms(pm.taskDurationMs) },
            { metric: 'JS Heap Used', value: pm.jsHeapUsedSizeMb != null ? `${pm.jsHeapUsedSizeMb} MB` : 'N/A' },
            { metric: 'Network Trace Id', value: pm.networkTraceId ?? 'N/A' },
            { metric: 'Finished Requests', value: pm.networkSummary?.finishedRequests != null ? String(pm.networkSummary.finishedRequests) : 'N/A' },
            { metric: 'Failed Requests', value: pm.networkSummary?.failedRequests != null ? String(pm.networkSummary.failedRequests) : 'N/A' },
            { metric: 'Dropped Requests', value: pm.networkSummary?.droppedRequestStarts != null ? String(pm.networkSummary.droppedRequestStarts) : 'N/A' },
          ], { separator: true });
          perfTable.printTable();

          // Stratify the slowest-requests output into API and static-asset
          // tables. The API table is the stable cross-run signal (Kibana
          // API responses are not disk-cached); the static-asset table is
          // informational and will naturally vary depending on browser
          // cache state. Fall back to the unified `slowestRequests` when
          // a report was generated before stratification was added.
          const hasStratified =
            Array.isArray(pm.slowestApiRequests) || Array.isArray(pm.slowestStaticRequests);
          if (hasStratified) {
            printSlowestRequestsTable('Slowest API Requests', pm.slowestApiRequests);
            printSlowestRequestsTable('Slowest Static Assets', pm.slowestStaticRequests);
          } else {
            printSlowestRequestsTable('Slowest Network Requests', pm.slowestRequests);
          }
        }

      } catch (innerError: any) {
        console.error(`Error processing file '${file}':`, innerError.message);
      }
    });
  } catch (error: any) {
    console.error('An error occurred while trying to read the report directory:', error.message);
  }
}
