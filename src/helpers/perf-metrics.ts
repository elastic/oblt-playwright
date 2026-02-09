import { Page } from '@playwright/test';
import { Logger } from 'winston';

/**
 * Creates a performance metrics collector backed by the Chrome DevTools Protocol.
 *
 * Usage:
 *   const perf = await createPerfCollector(page, log);
 *   await perf.takeBaseline();          // snapshot CDP counters
 *   await page.reload();                // the navigation you measure
 *   const data = await perf.collect();  // gather all metrics
 *   await perf.dispose();               // detach CDP session
 *
 * The measured navigation MUST be a full page load (not a hash-only change)
 * for LCP / FCP to be available.
 */
export async function createPerfCollector(page: Page, log: Logger) {
  const cdpSession = await page.context().newCDPSession(page);
  await cdpSession.send('Performance.enable', { timeDomain: 'timeTicks' });
  log.info('PerfMetrics: CDP session active');

  let baseline: Map<string, number> | null = null;

  return {
    async takeBaseline() {
      const { metrics } = await cdpSession.send('Performance.getMetrics');
      baseline = new Map(metrics.map((m: { name: string; value: number }) => [m.name, m.value]));
      log.info('PerfMetrics: baseline snapshot taken');
    },

    async collect() {
      // Enforce that takeBaseline() must be called before collect()
      if (baseline === null) {
        throw new Error('PerfMetrics: takeBaseline() must be called before collect()');
      }

      // --- Web Vitals (in-page query) ---
      const { lcp, fcp } = await page.evaluate(() => {
        return new Promise<{ lcp: number | null; fcp: number | null }>((resolve) => {
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
          const fcp = fcpEntry ? Math.round(fcpEntry.startTime) : null;

          let lcp: number | null = null;
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                lcp = Math.round(entries[entries.length - 1].startTime);
              }
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
            setTimeout(() => { observer.disconnect(); resolve({ lcp, fcp }); }, 100);
          } catch {
            resolve({ lcp: null, fcp });
          }
        });
      });

      // --- Navigation Timing (in-page query) ---
      const { ttfb, domContentLoaded, load } = await page.evaluate(() => {
        const entries = performance.getEntriesByType('navigation');
        if (!entries.length) return { ttfb: 0, domContentLoaded: 0, load: 0 };
        const nav = entries[0] as PerformanceNavigationTiming;
        return {
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
          load: nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
        };
      });

      // --- CDP Performance domain (delta from baseline) ---
      const { metrics } = await cdpSession.send('Performance.getMetrics');
      const current = new Map(metrics.map((m: { name: string; value: number }) => [m.name, m.value]));
      const delta = (name: string) => (current.get(name) ?? 0) - (baseline.get(name) ?? 0);

      const result = {
        lcp,
        fcp,
        ttfb,
        domContentLoaded,
        load,
        scriptDuration: Math.round(delta('ScriptDuration') * 1000),
        layoutDuration: Math.round(delta('LayoutDuration') * 1000),
        recalcStyleDuration: Math.round(delta('RecalcStyleDuration') * 1000),
        taskDuration: Math.round(delta('TaskDuration') * 1000),
        jsHeapUsedSize: Math.round((current.get('JSHeapUsedSize') ?? 0) / (1024 * 1024)),
      };

      log.info(
        `PerfMetrics collected: LCP=${result.lcp ?? 'N/A'}ms, ` +
        `FCP=${result.fcp ?? 'N/A'}ms, TTFB=${result.ttfb}ms, ` +
        `DOMContentLoaded=${result.domContentLoaded}ms, Load=${result.load}ms`
      );

      return result;
    },

    async dispose() {
      await cdpSession.detach();
      log.info('PerfMetrics: CDP session detached');
    },
  };
}

export type PerfCollector = Awaited<ReturnType<typeof createPerfCollector>>;
