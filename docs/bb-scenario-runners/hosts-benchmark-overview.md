# Hosts Benchmark Test Overview

## Purpose

This test measures how fast the Kibana **Hosts** page renders and becomes usable for a defined scenario (time range, host limit, and zoom).

It is designed to produce **stable, comparable** results across runs and scenarios.

## What the test validates

For each Hosts scenario, the test confirms that:

- The page opens with the intended scenario state (time range + host limit).
- Core visual elements are visible and populated:
  - host table
  - KPI cards
  - key charts
- No known data-loading error state is shown.

## How measurement is conducted

The test intentionally separates **setup/warm-up** from the **measured window**.

### 1) Setup and state stabilization (not measured)

Before timing starts, the test:

- Opens Hosts once to let Kibana generate its canonical URL state.
- Rewrites URL state to the desired scenario values (`dateRange`, `limit`).
- Performs one full warm-up navigation to that desired URL.
- Waits until all required visualizations are fully rendered.

This stage exists because Kibana may rewrite URL state during boot and may load one-time assets/endpoints on first access. Including that in measurements would add noise and reduce comparability.

### 2) Measured navigation

Only after warm-up is complete, the test starts measurement:

- Takes performance baseline snapshot.
- Starts network trace capture.
- Navigates again to the **same desired URL**.
- Waits for:
  - loading completion,
  - correct URL state,
  - full visualization readiness.

Then it collects performance and network data.

## What is measured

The report includes:

- Browser timing metrics (for example LCP, FCP, TTFB, DOM Content Loaded, Page Load).
- Runtime work metrics (script, layout, style recalculation, task duration, JS heap).
- Network summary (finished/failed requests).
- Slowest requests, split into:
  - API requests
  - static assets

This split helps separate backend/data latency from static asset/cache effects.

## Why this approach is used

This benchmark targets **returning-user performance** (realistic day-to-day usage), not first-ever cold start.

By warming up first and measuring the second navigation, the test minimizes one-time startup effects and focuses on scenario-specific render cost. This makes trend tracking and scenario comparison reliable for decision-making.
