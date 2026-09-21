import { Logger } from 'winston';
import { REPORT_CLUSTER_API_KEY, REPORT_CLUSTER_KIBANA } from '../env';

/*
Failure screenshots are hosted in the reporting cluster's Kibana through the
Files plugin.
*/
const FILE_KIND = 'defaultImage';
const SHARE_VALIDITY_DAYS = 90;

// One deadline for the whole upload. Without it an unresponsive reporting
// cluster stalls fixture teardown and the JSON report is never written.
const UPLOAD_TIMEOUT_MS = 30_000;

async function kibanaRequest<T>(
  method: string,
  path: string,
  body: object | Buffer,
  signal: AbortSignal,
): Promise<T> {
  const isBlob = Buffer.isBuffer(body);
  const response = await fetch(`${REPORT_CLUSTER_KIBANA}${path}`, {
    method,
    signal,
    headers: {
      Authorization: `ApiKey ${REPORT_CLUSTER_API_KEY}`,
      'kbn-xsrf': 'true',
      'x-elastic-internal-origin': 'oblt-playwright',
      'Content-Type': isBlob ? 'image/png' : 'application/json',
    },
    body: isBlob ? new Uint8Array(body) : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} returned ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

export async function uploadFailureScreenshot(
  log: Logger,
  png: Buffer,
  fileName: string,
): Promise<string | undefined> {
  if (!REPORT_CLUSTER_KIBANA) {
    return undefined;
  }

  const signal = AbortSignal.timeout(UPLOAD_TIMEOUT_MS);

  try {
    const created = await kibanaRequest<{ file: { id: string } }>(
      'POST',
      `/api/files/files/${FILE_KIND}`,
      { name: fileName, mimeType: 'image/png' },
      signal,
    );

    await kibanaRequest('PUT', `/api/files/files/${FILE_KIND}/${created.file.id}/blob`, png, signal);

    const share = await kibanaRequest<{ token: string }>(
      'POST',
      `/api/files/shares/${FILE_KIND}/${created.file.id}`,
      { validUntil: Date.now() + SHARE_VALIDITY_DAYS * 24 * 60 * 60 * 1000 },
      signal,
    );

    return `${REPORT_CLUSTER_KIBANA}/api/files/public/blob/${fileName}.png?token=${share.token}`;
  } catch (error) {
    log.warn(`Could not upload the failure screenshot: ${String(error)}`);
    return undefined;
  }
}
