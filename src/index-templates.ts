const requestTimingProperties = {
  requestId: { type: 'keyword' },
  url: { type: 'keyword' },
  method: { type: 'keyword' },
  resourceType: { type: 'keyword' },
  status: { type: 'short' },
  mimeType: { type: 'keyword' },
  protocol: { type: 'keyword' },
  fromDiskCache: { type: 'boolean' },
  fromServiceWorker: { type: 'boolean' },
  encodedDataLength: { type: 'long' },
  startTimeEpochMs: { type: 'date' },
  ttfbMs: { type: 'long' },
  durationMs: { type: 'long' },
  finished: { type: 'boolean' },
  failed: { type: 'boolean' },
  errorText: { type: 'keyword' },
};

const networkSummaryProperties = {
  finishedRequests: { type: 'long' },
  failedRequests: { type: 'long' },
  inflightRequests: { type: 'long' },
  droppedRequestStarts: { type: 'long' },
  totalEncodedDataLength: { type: 'long' },
};

const slowRequestProperties = {
  requestId: { type: 'keyword' },
  url: { type: 'keyword' },
  method: { type: 'keyword' },
  resourceType: { type: 'keyword' },
  status: { type: 'short' },
  ttfbMs: { type: 'long' },
  durationMs: { type: 'long' },
  encodedDataLength: { type: 'long' },
  failed: { type: 'boolean' },
};

const performanceMetricsProperties = {
  lcpMs: { type: 'long' },
  fcpMs: { type: 'long' },
  ttfbMs: { type: 'long' },
  domContentLoadedMs: { type: 'long' },
  loadMs: { type: 'long' },
  scriptDurationMs: { type: 'long' },
  layoutDurationMs: { type: 'long' },
  recalcStyleDurationMs: { type: 'long' },
  taskDurationMs: { type: 'long' },
  jsHeapUsedSizeMb: { type: 'long' },
  networkTraceId: { type: 'keyword' },
  networkSummary: {
    properties: networkSummaryProperties,
  },
  slowestRequests: {
    type: 'nested',
    properties: slowRequestProperties,
  },
};

export const oblt_playwright = {
      mappings: {
        properties: {
          title: { type: 'text' },
          startTime: { type: 'date' },
          doc_count: {
            properties: {
              apm: { type: 'long' },
              logs: { type: 'long' },
              metrics: { type: 'long' },
            },
          },
          period: { type: 'keyword' },
          status: { type: 'keyword' },
          duration: { type: 'float' },
          errors: { type: 'object' },
          cluster_name: { type: 'keyword' },
          build_flavor: { type: 'keyword' },
          steps: {
            properties: {
              step01: {
                properties: {
                  error: { type: 'keyword' },
                  duration: { type: 'long' },
                  description: { type: 'text' },
                  start: { type: 'date' },
                  end: { type: 'date' },
                  status: { type: 'keyword' },
                },
              },
              step02: {
                properties: {
                  error: { type: 'keyword' },
                  duration: { type: 'long' },
                  description: { type: 'text' },
                  start: { type: 'date' },
                  end: { type: 'date' },
                  status: { type: 'keyword' },
                },
              },
              step03: {
                properties: {
                  error: { type: 'keyword' },
                  duration: { type: 'long' },
                  description: { type: 'text' },
                  start: { type: 'date' },
                  end: { type: 'date' },
                  status: { type: 'keyword' },
                },
              },
              step04: {
                properties: {
                  error: { type: 'keyword' },
                  duration: { type: 'long' },
                  description: { type: 'text' },
                  start: { type: 'date' },
                  end: { type: 'date' },
                  status: { type: 'keyword' },
                },
              },
              step05: {
                properties: {
                  error: { type: 'keyword' },
                  duration: { type: 'long' },
                  description: { type: 'text' },
                  start: { type: 'date' },
                  end: { type: 'date' },
                  status: { type: 'keyword' },
                },
              },
            },
          },
          cacheStats: { type: 'object' },
          performanceMetrics: {
            properties: performanceMetricsProperties,
          },
          measurements: { type: 'object' },
        },
      },
    }

export const oblt_playwright_network_traces = {
      mappings: {
        properties: {
          title: { type: 'text' },
          startTime: { type: 'date' },
          period: { type: 'keyword' },
          status: { type: 'keyword' },
          duration: { type: 'float' },
          errors: { type: 'object' },
          cluster_name: { type: 'keyword' },
          build_flavor: { type: 'keyword' },
          networkTraceId: { type: 'keyword' },
          captureStartedAt: { type: 'date' },
          captureEndedAt: { type: 'date' },
          maxNetworkRequests: { type: 'long' },
          performanceMetrics: {
            properties: performanceMetricsProperties,
          },
          networkSummary: {
            properties: networkSummaryProperties,
          },
          slowestRequests: {
            type: 'nested',
            properties: slowRequestProperties,
          },
          requests: {
            type: 'nested',
            properties: requestTimingProperties,
          },
        },
      },
    }

export const oblt_playwright_logs = {
      mappings: {
        properties: {
          level: { type: 'text' },
          message: { type: 'text' },
          project: { type: 'keyword' },
          testName: { type: 'keyword' },
          timestamp: { type: 'date' },
          workerIndex: { type: 'integer' },
        },
      },
    }
