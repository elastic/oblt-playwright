import { Logger } from 'winston';
import { REPORT_CLUSTER_API_KEY, REPORT_CLUSTER_KIBANA } from '../env';

/*
Failure screenshots and traces are hosted in the reporting cluster's Kibana
through the Files plugin. Screenshots get a public share link. Traces contain
session data, so they are not shared and can only be downloaded with a Kibana
login.
*/
export const SCREENSHOT_FILE = { kind: 'defaultImage', mimeType: 'image/png', share: true };
export const TRACE_FILE = { kind: 'observabilityFilesCases', mimeType: 'application/zip', share: false };

export type FileOptions = { kind: string; mimeType: string; share: boolean };

const SHARE_VALIDITY_DAYS = 14;

// One deadline for the whole upload. Without it an unresponsive reporting
// cluster stalls fixture teardown and the JSON report is never written.
const UPLOAD_TIMEOUT_MS = 30_000;

async function kibanaRequest<T>(
  method: string,
  path: string,
  body: object | Buffer,
  signal: AbortSignal,
  contentType = 'application/json',
): Promise<T> {
  const isBlob = Buffer.isBuffer(body);
  let response: Response;
  try {
    response = await fetch(`${REPORT_CLUSTER_KIBANA}${path}`, {
      method,
      signal,
      headers: {
        Authorization: `ApiKey ${REPORT_CLUSTER_API_KEY}`,
        'kbn-xsrf': 'true',
        'x-elastic-internal-origin': 'oblt-playwright',
        'Content-Type': isBlob ? contentType : 'application/json',
      },
      body: isBlob ? new Uint8Array(body) : JSON.stringify(body),
    });
  } catch (error) {
    // Names the call that failed; a bare timeout does not say which of the
    // three it was. The host is left out, as it is everywhere else in reports.
    throw new Error(`${method} ${path} failed: ${String(error)}`, { cause: error });
  }
  if (!response.ok) {
    throw new Error(`${method} ${path} returned ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

// Returns the URL of the uploaded file, or undefined if the upload failed.
// `fileName` includes the extension.
export async function uploadFile(
  log: Logger,
  content: Buffer,
  fileName: string,
  { kind, mimeType, share }: FileOptions,
): Promise<string | undefined> {
  if (!REPORT_CLUSTER_KIBANA) {
    return undefined;
  }

  const signal = AbortSignal.timeout(UPLOAD_TIMEOUT_MS);

  try {
    const created = await kibanaRequest<{ file: { id: string } }>(
      'POST',
      `/api/files/files/${kind}`,
      { name: fileName.replace(/\.[^.]+$/, ''), mimeType },
      signal,
    );

    await kibanaRequest('PUT', `/api/files/files/${kind}/${created.file.id}/blob`, content, signal, mimeType);

    if (!share) {
      return `${REPORT_CLUSTER_KIBANA}/api/files/files/${kind}/${created.file.id}/blob/${fileName}`;
    }

    const shared = await kibanaRequest<{ token: string }>(
      'POST',
      `/api/files/shares/${kind}/${created.file.id}`,
      { validUntil: Date.now() + SHARE_VALIDITY_DAYS * 24 * 60 * 60 * 1000 },
      signal,
    );

    return `${REPORT_CLUSTER_KIBANA}/api/files/public/blob/${fileName}?token=${shared.token}`;
  } catch (error) {
    log.warn(`Could not upload ${fileName}: ${String(error)}`);
    return undefined;
  }
}
