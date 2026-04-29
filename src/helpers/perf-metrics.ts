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
      // --- Web Vitals + Navigation Timing (single in-page query) ---
      const { lcpMs, fcpMs, ttfbMs, domContentLoadedMs, loadMs } = await page.evaluate(() => {
        return new Promise<{
          lcpMs: number | null;
          fcpMs: number | null;
          ttfbMs: number;
          domContentLoadedMs: number;
          loadMs: number;
        }>((resolve) => {
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
          const fcpMs = fcpEntry ? Math.round(fcpEntry.startTime) : null;

          const entries = performance.getEntriesByType('navigation');
          const nav = (entries[0] as PerformanceNavigationTiming | undefined);
          const ttfbMs = nav ? Math.round(nav.responseStart - nav.requestStart) : 0;
          const domContentLoadedMs = nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0;
          const loadMs = nav && nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd - nav.startTime) : 0;

          let lcpMs: number | null = null;
          try {
            const observer = new PerformanceObserver((list) => {
              const lcpEntries = list.getEntries();
              if (lcpEntries.length > 0) {
                lcpMs = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
              }
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
            setTimeout(() => {
              observer.disconnect();
              resolve({ lcpMs, fcpMs, ttfbMs, domContentLoadedMs, loadMs });
            }, 100);
          } catch {
            resolve({ lcpMs: null, fcpMs, ttfbMs, domContentLoadedMs, loadMs });
          }
        });
      });

      // --- CDP Performance domain (delta from baseline) ---
      const { metrics } = await cdpSession.send('Performance.getMetrics');
      const current = new Map(metrics.map((m: { name: string; value: number }) => [m.name, m.value]));
      if (!baseline) {
        throw new Error('PerfMetrics: collect() called before takeBaseline(); call takeBaseline() first to record baseline counters.');
      }
      const base = baseline;
      const delta = (name: string) => (current.get(name) ?? 0) - (base.get(name) ?? 0);

      const result = {
        lcpMs,
        fcpMs,
        ttfbMs,
        domContentLoadedMs,
        loadMs,
        scriptDurationMs: Math.round(delta('ScriptDuration') * 1000),
        layoutDurationMs: Math.round(delta('LayoutDuration') * 1000),
        recalcStyleDurationMs: Math.round(delta('RecalcStyleDuration') * 1000),
        taskDurationMs: Math.round(delta('TaskDuration') * 1000),
        jsHeapUsedSizeMb: Math.round((current.get('JSHeapUsedSize') ?? 0) / (1024 * 1024)),
      };

      log.info(
        `PerfMetrics collected: LCP=${result.lcpMs ?? 'N/A'}ms, ` +
        `FCP=${result.fcpMs ?? 'N/A'}ms, TTFB=${result.ttfbMs}ms, ` +
        `DOMContentLoaded=${result.domContentLoadedMs}ms, Load=${result.loadMs}ms`
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
