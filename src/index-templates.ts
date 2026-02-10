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
            properties: {
              lcp: { type: 'long' },
              fcp: { type: 'long' },
              ttfb: { type: 'long' },
              domContentLoaded: { type: 'long' },
              load: { type: 'long' },
              scriptDuration: { type: 'long' },
              layoutDuration: { type: 'long' },
              recalcStyleDuration: { type: 'long' },
              taskDuration: { type: 'long' },
              jsHeapUsedSize: { type: 'long' },
            },
          },
          measurements: { type: 'object' },
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
