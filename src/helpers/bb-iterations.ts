import { TestInfo } from '@playwright/test';
import { Logger } from 'winston';
import { NetworkTraceCapture } from './network-trace';
import { writeJsonReport, writeNetworkTraceReport } from './reporter';

// Each scenario runs the measured navigation three times to expose both
// cold-cache cost (first hit) and warmed steady-state cost (subsequent hits).
export type IterationDescriptor = {
  label: 'cold' | 'warm1' | 'warm2';
  step: 'step01' | 'step02' | 'step03';
};

export const ITERATIONS: IterationDescriptor[] = [
  { label: 'cold', step: 'step01' },
  { label: 'warm1', step: 'step02' },
  { label: 'warm2', step: 'step03' },
];

export type IterationResult = {
  label: IterationDescriptor['label'];
  perfData: object;
  networkTrace: NetworkTraceCapture;
};

// Per-iteration reports: one JSON + one network-trace file per iteration,
// suffixed and title-tagged so cold/warm1/warm2 are distinguishable both on
// disk and in the printed console output. When no iteration completed (e.g. the
// test failed first), still emit a report with whatever stepData was captured
// so the failure is recorded.
export async function writeIterationReports(
  log: Logger,
  clusterData: unknown,
  testInfo: TestInfo,
  testStartTime: string,
  docCount: object,
  stepData: object[] | undefined,
  iterations: IterationResult[] | undefined,
): Promise<string[]> {
  const reports: string[] = [];

  if (!Array.isArray(iterations) || iterations.length === 0) {
    const reportFiles = await writeJsonReport(
      log, clusterData, testInfo, testStartTime, docCount, stepData,
    );
    reports.push(...reportFiles.filter(item => typeof item === 'string'));
    return reports;
  }

  for (const iteration of iterations) {
    const fileNameSuffix = `_${iteration.label}`;
    const titleSuffix = ` [${iteration.label}]`;
    const reportFiles = await writeJsonReport(
      log, clusterData, testInfo, testStartTime, docCount,
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
  return reports;
}
