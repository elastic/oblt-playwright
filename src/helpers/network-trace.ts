import { Page } from '@playwright/test';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';

export type NetworkRequestTiming = {
  requestId: string;
  url: string;
  method: string;
  resourceType?: string;
  status?: number;
  mimeType?: string;
  protocol?: string;
  fromDiskCache?: boolean;
  fromServiceWorker?: boolean;
  encodedDataLength?: number;
  startTimeEpochMs?: number;
  ttfbMs?: number;
  durationMs?: number;
  finished: boolean;
  failed?: boolean;
  errorText?: string;
};

export type SlowNetworkRequest = Pick<
  NetworkRequestTiming,
  'requestId' | 'url' | 'method' | 'resourceType' | 'status' | 'ttfbMs' | 'durationMs' | 'encodedDataLength' | 'failed'
>;

export type NetworkTraceSummary = {
  finishedRequests: number;
  failedRequests: number;
  inflightRequests: number;
  droppedRequestStarts: number;
  totalEncodedDataLength: number;
};

export type NetworkTraceCapture = {
  traceId: string;
  captureStartedAt: string;
  captureEndedAt: string;
  maxNetworkRequests: number;
  summary: NetworkTraceSummary;
  slowestRequests: SlowNetworkRequest[];
  requests: NetworkRequestTiming[];
};

export type NetworkTraceCollectorOptions = {
  maxNetworkRequests?: number;
  slowRequestCount?: number;
};

type InProgressRequest = NetworkRequestTiming & {
  requestStartTs?: number;
};

// Keep the report-facing slow-request list small and stable even if the full trace schema grows.
function toSlowNetworkRequest(request: NetworkRequestTiming): SlowNetworkRequest {
  return {
    requestId: request.requestId,
    url: request.url,
    method: request.method,
    resourceType: request.resourceType,
    status: request.status,
    ttfbMs: request.ttfbMs,
    durationMs: request.durationMs,
    encodedDataLength: request.encodedDataLength,
    failed: request.failed,
  };
}

// Prefer total request duration and use TTFB only as a tie-breaker for equally long requests.
function bySlowestRequest(left: NetworkRequestTiming, right: NetworkRequestTiming): number {
  const leftDuration = left.durationMs ?? -1;
  const rightDuration = right.durationMs ?? -1;
  if (leftDuration !== rightDuration) {
    return rightDuration - leftDuration;
  }

  const leftTtfb = left.ttfbMs ?? -1;
  const rightTtfb = right.ttfbMs ?? -1;
  return rightTtfb - leftTtfb;
}

/**
 * Creates an opt-in network trace collector backed by the Chrome DevTools Protocol.
 *
 * Usage:
 *   const trace = await createNetworkTraceCollector(page, log);
 *   await trace.start();             // open a bounded capture window
 *   await page.reload();             // the navigation or action you want to inspect
 *   const data = await trace.collect();
 *   await trace.dispose();           // detach CDP session
 *
 * This helper is intended for deeper investigation than the main performance
 * report. It captures per-request timing details plus a compact slow-request
 * summary so callers can publish a small correlated report and, when needed,
 * persist the full request trace separately.
 */
export async function createNetworkTraceCollector(
  page: Page,
  log: Logger,
  options: NetworkTraceCollectorOptions = {},
) {
  const cdpSession = await page.context().newCDPSession(page);
  const maxNetworkRequests = options.maxNetworkRequests ?? 1000;
  const slowRequestCount = options.slowRequestCount ?? 5;

  await cdpSession.send('Network.enable');
  log.info(
    `NetworkTrace: CDP session active (maxNetworkRequests=${maxNetworkRequests}, slowRequestCount=${slowRequestCount})`,
  );

  const inProgress = new Map<string, InProgressRequest>();
  const completedRequests: NetworkRequestTiming[] = [];

  let activeTraceId: string | null = null;
  let captureStartedAt: string | null = null;
  let droppedRequestStarts = 0;
  let isCapturing = false;

  const shouldDropStart = (requestId: string): boolean => {
    if (inProgress.has(requestId)) {
      return false;
    }

    if (inProgress.size + completedRequests.length >= maxNetworkRequests) {
      droppedRequestStarts++;
      return true;
    }

    return false;
  };

  cdpSession.on('Network.requestWillBeSent', (event: any) => {
    if (!isCapturing || !event?.request?.url || !event?.requestId) {
      return;
    }

    const requestId: string = event.requestId;
    if (shouldDropStart(requestId)) {
      return;
    }

    const request: InProgressRequest = {
      requestId,
      url: event.request.url,
      method: event.request.method,
      resourceType: event.type,
      startTimeEpochMs: typeof event.wallTime === 'number' ? Math.round(event.wallTime * 1000) : undefined,
      finished: false,
      requestStartTs: typeof event.timestamp === 'number' ? event.timestamp : undefined,
    };

    inProgress.set(requestId, request);
  });

  cdpSession.on('Network.responseReceived', (event: any) => {
    if (!isCapturing || !event?.requestId) {
      return;
    }

    const request = inProgress.get(event.requestId);
    if (!request) {
      return;
    }

    request.status = event?.response?.status;
    request.mimeType = event?.response?.mimeType;
    request.protocol = event?.response?.protocol;
    request.fromDiskCache = event?.response?.fromDiskCache;
    request.fromServiceWorker = event?.response?.fromServiceWorker;

    if (typeof event.timestamp === 'number' && request.requestStartTs != null) {
      request.ttfbMs = Math.max(0, Math.round((event.timestamp - request.requestStartTs) * 1000));
    }
  });

  cdpSession.on('Network.loadingFinished', (event: any) => {
    if (!isCapturing || !event?.requestId) {
      return;
    }

    const request = inProgress.get(event.requestId);
    if (!request) {
      return;
    }

    if (typeof event.timestamp === 'number' && request.requestStartTs != null) {
      request.durationMs = Math.max(0, Math.round((event.timestamp - request.requestStartTs) * 1000));
    }
    if (typeof event.encodedDataLength === 'number') {
      request.encodedDataLength = event.encodedDataLength;
    }
    request.finished = true;

    const { requestStartTs, ...publicRequest } = request;
    completedRequests.push(publicRequest);
    inProgress.delete(event.requestId);
  });

  cdpSession.on('Network.loadingFailed', (event: any) => {
    if (!isCapturing || !event?.requestId) {
      return;
    }

    const request = inProgress.get(event.requestId);
    if (!request) {
      return;
    }

    if (typeof event.timestamp === 'number' && request.requestStartTs != null) {
      request.durationMs = Math.max(0, Math.round((event.timestamp - request.requestStartTs) * 1000));
    }
    request.finished = true;
    request.failed = true;
    request.errorText = event?.errorText;

    const { requestStartTs, ...publicRequest } = request;
    completedRequests.push(publicRequest);
    inProgress.delete(event.requestId);
  });

  return {
    async start(traceId = randomUUID()) {
      activeTraceId = traceId;
      captureStartedAt = new Date().toISOString();
      droppedRequestStarts = 0;
      completedRequests.length = 0;
      inProgress.clear();
      isCapturing = true;
      log.info(`NetworkTrace: capture started (traceId=${traceId})`);
      return traceId;
    },

    async collect(): Promise<NetworkTraceCapture> {
      if (!isCapturing || !activeTraceId || !captureStartedAt) {
        throw new Error('NetworkTrace: collect() called before start(); call start() first to begin a capture window.');
      }

      isCapturing = false;

      const summary: NetworkTraceSummary = {
        finishedRequests: completedRequests.length,
        failedRequests: completedRequests.filter((request) => request.failed === true).length,
        inflightRequests: inProgress.size,
        droppedRequestStarts,
        totalEncodedDataLength: completedRequests.reduce(
          (total, request) => total + (request.encodedDataLength ?? 0),
          0,
        ),
      };

      const trace: NetworkTraceCapture = {
        traceId: activeTraceId,
        captureStartedAt,
        captureEndedAt: new Date().toISOString(),
        maxNetworkRequests,
        summary,
        slowestRequests: completedRequests
          .slice()
          .sort(bySlowestRequest)
          .slice(0, slowRequestCount)
          .map(toSlowNetworkRequest),
        requests: completedRequests.slice(),
      };

      log.info(
        `NetworkTrace: capture collected (traceId=${trace.traceId}, finished=${summary.finishedRequests}, failed=${summary.failedRequests}, inflight=${summary.inflightRequests}, dropped=${summary.droppedRequestStarts})`,
      );

      return trace;
    },

    async dispose() {
      await cdpSession.detach();
      log.info('NetworkTrace: CDP session detached');
    },
  };
}

export type NetworkTraceCollector = Awaited<ReturnType<typeof createNetworkTraceCollector>>;