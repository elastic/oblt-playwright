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

const outputDirectory = CI === 'true' ? '/home/runner/work/oblt-playwright/' : REPORT_DIR;

export async function writeJsonReport(
  log: Logger,
  clusterData: any,
  testInfo: TestInfo,
  testStartTime: string,
  docsCount?: object,
  stepData?: object[],
  cacheStats?: object,
) {
  let build_flavor: any = clusterData.version.build_flavor;
  let cluster_name: any = clusterData.cluster_name;
  let files: string[] = [];

  const fileName = `${new Date(testStartTime).toISOString().replace(/:/g, '_')}_${testInfo.title.replace(/\s/g, "_").toLowerCase()}.json`;
  files.push(fileName);

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }
  log.info(`Saving report file to ${outputDirectory}`);
  const outputPath = path.join(outputDirectory, fileName);

  const reportData = {
    title: testInfo.title,
    startTime: testStartTime,
    doc_count: docsCount,
    period: ABSOLUTE_TIME_RANGE
      ? `From ${START_DATE} to ${END_DATE}`
      : `Last ${TIME_VALUE} ${TIME_UNIT}`,
    status: testInfo.status,
    duration: testInfo.duration,
    ...(testInfo.errors.length > 0 && { errors: { message: testInfo.errors.map(e => (e.message ? e.message.replace(/\u001b\[[0-9;]*m|\u001b/g, '') : '')).join('\n') } }),
    cluster_name: cluster_name,
    build_flavor: build_flavor,
    steps: stepData ? stepData : null,
    ...(cacheStats && { cacheStats }),
  };
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
  return files;
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

      } catch (innerError: any) {
        console.error(`Error processing file '${file}':`, innerError.message);
      }
    });
  } catch (error: any) {
    console.error('An error occurred while trying to read the report directory:', error.message);
  }
}
