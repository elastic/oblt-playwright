export const KIBANA_HOST = `${process.env.KIBANA_HOST}`;
export const KIBANA_USERNAME = `${process.env.KIBANA_USERNAME}`;
export const KIBANA_PASSWORD = `${process.env.KIBANA_PASSWORD}`;
export const ELASTICSEARCH_HOST = `${process.env.ELASTICSEARCH_HOST}`?.replace(/\/$/, '');
export const API_KEY = (process.env.API_KEY || process.env.ELASTICSEARCH_API_KEY)?.replace(/^ApiKey\s+/i, '') ?? '';
export const TIME_UNIT = process.env.TIME_UNIT || 'Days';
export const TIME_VALUE = process.env.TIME_VALUE || '7';
export const START_DATE = process.env.START_DATE || '2025-09-06T09:00:00.000Z';
export const END_DATE = process.env.END_DATE || '2025-09-07T09:00:00.000Z';
export const ABSOLUTE_TIME_RANGE = process.env.ABSOLUTE_TIME_RANGE === 'true';
export const REPORT_CLUSTER_ES = `${process.env.REPORT_CLUSTER_ES}`?.replace(/\/$/, '');
export const REPORT_CLUSTER_API_KEY = `${process.env.REPORT_CLUSTER_API_KEY}`?.replace(/^ApiKey\s+/i, '') ?? '';
export const REPORT_FILE = `${process.env.REPORT_FILE}`;
export const CI = process.env.CI || 'false';
export const REPORT_DIR = process.env.REPORT_DIR || './playwright-report';

/*
A set of variables used in cross-cluster search test.
*/
export const REMOTE_CLUSTERS = `${process.env.REMOTE_CLUSTERS}`;
export const REMOTE_CCS_CLUSTER_01 = `${process.env.REMOTE_CCS_CLUSTER_01}`;
export const REMOTE_CCS_CLUSTER_02 = `${process.env.REMOTE_CCS_CLUSTER_02}`;
export const REMOTE_CCS_CLUSTER_03 = `${process.env.REMOTE_CCS_CLUSTER_03}`;
export const REMOTE_CCS_CLUSTER_04 = `${process.env.REMOTE_CCS_CLUSTER_04}`;
export const RANGE = `${process.env.RANGE}`;
