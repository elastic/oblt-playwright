export const KIBANA_HOST = `${process.env.KIBANA_HOST}`;
export const KIBANA_USERNAME = `${process.env.KIBANA_USERNAME}`;
export const KIBANA_PASSWORD = `${process.env.KIBANA_PASSWORD}`;
export const ELASTICSEARCH_HOST = `${process.env.ELASTICSEARCH_HOST}`?.replace(/\/$/, '');
export const ELASTICSEARCH_USER = `${process.env.ELASTICSEARCH_USER}`;
export const ELASTICSEARCH_PASSWORD = `${process.env.ELASTICSEARCH_PASSWORD}`;
export const API_KEY = (process.env.API_KEY || process.env.ELASTICSEARCH_API_KEY)?.replace(/^ApiKey\s+/i, '') ?? '';
export const TIME_UNIT = process.env.TIME_UNIT;
export const TIME_VALUE = process.env.TIME_VALUE;
export const START_DATE = process.env.START_DATE;
export const END_DATE = process.env.END_DATE;
export const ABSOLUTE_TIME_RANGE = process.env.ABSOLUTE_TIME_RANGE === 'true';
export const REPORT_CLUSTER_ES = `${process.env.REPORT_CLUSTER_ES}`?.replace(/\/$/, '');
export const REPORT_CLUSTER_API_KEY = `${process.env.REPORT_CLUSTER_API_KEY}`?.replace(/^ApiKey\s+/i, '') ?? '';
export const REPORT_FILE = `${process.env.REPORT_FILE}`;
export const CI = process.env.CI || 'false';
export const REPORT_DIR = process.env.REPORT_DIR || './playwright-report';
export const TRIGGER = process.env.TRIGGER;


function deriveReportClusterKibana(): string | undefined {
  const kibana = REPORT_CLUSTER_ES.replace(/^(https?:\/\/[^./]+)\.es\./, '$1.kb.');
  return kibana === REPORT_CLUSTER_ES ? undefined : kibana;
}
export const REPORT_CLUSTER_KIBANA = deriveReportClusterKibana();

function deriveClusterName(): string | undefined {
  try {
    const [label] = new URL(KIBANA_HOST).hostname.split('.');
    return label.replace(/-[0-9a-f]{6}$/, '') || undefined;
  } catch {
    return undefined;
  }
}
export const CLUSTER_NAME = deriveClusterName();

/*
Base URL for the source permalinks in failure reports. Links point at the commit
that ran, so a line number stays correct after the file changes. Journeys run
from the Docker image rather than GitHub Actions, so their commit is baked in as
GIT_COMMIT at image build time; GITHUB_SHA covers the walkthrough suites, which
do run in Actions.
*/
const sourceServer = process.env.GITHUB_SERVER_URL || 'https://github.com';
const sourceRepository = process.env.GITHUB_REPOSITORY || 'elastic/oblt-playwright';
const sourceRef = process.env.GITHUB_SHA || process.env.GIT_COMMIT || 'main';
export const SOURCE_BASE_URL = `${sourceServer}/${sourceRepository}/blob/${sourceRef}`;

/*
A set of variables used in cross-cluster search test.
*/
export const REMOTE_CLUSTERS = `${process.env.REMOTE_CLUSTERS}`;
export const REMOTE_CCS_CLUSTER_01 = `${process.env.REMOTE_CCS_CLUSTER_01}`;
export const REMOTE_CCS_CLUSTER_02 = `${process.env.REMOTE_CCS_CLUSTER_02}`;
export const REMOTE_CCS_CLUSTER_03 = `${process.env.REMOTE_CCS_CLUSTER_03}`;
export const REMOTE_CCS_CLUSTER_04 = `${process.env.REMOTE_CCS_CLUSTER_04}`;
export const RANGE = `${process.env.RANGE}`;
