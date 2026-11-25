# Discover Benchmark Test Overview

## Purpose

This test measures how fast the Kibana **Discover** page renders and becomes usable for a defined scenario (a data view or a URL-embedded `_a` target, plus the configured time range).

It captures **both cold-cache and warmed steady-state** performance so the two can be compared directly.

## What the test validates

For each Discover scenario, the test confirms that:

- The page opens with the intended scenario state (data view or `_a` target, plus time range).
- Core elements are rendered:
  - the histogram chart
  - the first row of the documents grid
  - the search has finished (no pending update, hit count loaded)
- No known error state is shown (failed fetch, histogram error, no results).

## How measurement is conducted

The test performs **three measured navigations** back-to-back. There is no setup step: the Discover URL is built directly from the scenario, so the first navigation is the cold measurement.

Each iteration:

- Takes a fresh performance baseline.
- Starts a new network trace.
- Navigates to the scenario URL via `page.goto` (a full page load — no bfcache).
- Waits for the loading indicator to hide, then for the histogram, the first grid row and the finished search.
- Checks that the final URL still holds the scenario's time range and data view.
- Collects performance and network data, and emits its own JSON + network-trace report file.

The three iterations are labeled:

| Iteration | Label   | What it captures |
| --------- | ------- | ---------------- |
| 1         | `cold`  | First load of the scenario URL: includes one-time costs (chunks parsed by V8, cold Kibana endpoints, disk-cacheable static assets fetched from network). |
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
- Running all three in the same test, on the same page session, keeps the comparison fair: identical scenario, identical URL, identical assertions — only the cache state differs.
