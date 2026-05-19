# Hosts Benchmark Test Overview

## Purpose

This test measures how fast the Kibana **Hosts** page renders and becomes usable for a defined scenario (time range, host limit, and zoom).

It captures **both cold-cache and warmed steady-state** performance so the two can be compared directly.

## What the test validates

For each Hosts scenario, the test confirms that:

- The page opens with the intended scenario state (time range + host limit).
- Core visual elements are visible and populated:
  - host table
  - KPI cards
  - key charts
- No known data-loading error state is shown.

## How measurement is conducted

The test runs a one-time URL-state setup, then performs **three measured navigations** back-to-back.

### 1) URL-state setup (not measured)

Before any measurement:

- A zoom hook is installed via `addInitScript` so every navigation renders at the scenario zoom from the first paint.
- The Hosts page is opened once at its default state so Kibana writes its canonical URL shape (`_a=(...)` plus `controlPanels=`).
- The captured URL is rewritten to the scenario values (`dateRange`, `limit`) while preserving every other field Hosts wrote.

This stage is required infrastructure (it discovers the canonical URL shape); it is **not** a performance warm-up.

### 2) Three measured iterations

The same desired URL is loaded three times in a row. Each iteration:

- Takes a fresh performance baseline.
- Starts a new network trace.
- Navigates to the desired URL via `page.goto` (a full page load — no bfcache).
- Waits for loading completion, correct URL state, and full visualization readiness.
- Collects performance and network data, and emits its own JSON + network-trace report file.

The three iterations are labeled:

| Iteration | Label   | What it captures |
| --------- | ------- | ---------------- |
| 1         | `cold`  | First scenario-state load: includes one-time costs (Lens chart chunks parsed by V8, cold Kibana endpoints, disk-cacheable static assets fetched from network). |
| 2         | `warm1` | Steady-state load on a fully-warmed Kibana session. |
| 3         | `warm2` | Second steady-state sample; lets you sanity-check variance between consecutive warm runs. |

## What is reported

Each iteration produces:

- A JSON report (`..._cold.json`, `..._warm1.json`, `..._warm2.json`) containing browser timing, runtime work metrics, and the network summary for that iteration.
- A network-trace file (`..._cold.network-trace.json`, etc.) with the full per-request trace.

The console output prints one performance table per iteration so cold and warm numbers can be compared side-by-side without opening the JSON files. Slowest requests are split into API and static-asset tables.

## Why this approach is used

- The **cold** iteration models a user landing on the scenario for the first time after a Kibana restart or a fresh browser session.
- The **warm** iterations model the returning-user experience and provide the stable cross-run signal.
- Running both in the same test, on the same page session, keeps the cold-vs-warm comparison fair: identical scenario, identical URL, identical assertions — only the cache state differs.
