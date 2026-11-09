---
paths:
  - "tests/kibana/product-journeys/**"
  - "src/pom/**"
---

# Golden journeys

Golden journeys cover critical user paths. A red result has to mean the product is broken.

- **Assert on something only the expected result can render.** Every assertion that decides the verdict must match something only the expected end state can show, such as a value from the result. Generic checks (a chart is visible, a loading indicator, a stats line) run only after that. Example: #515, where the canvas check passed on the previous query's results.
- **Wait for the request the action sends.** Before clicking, arm `page.waitForResponse` for the request the action sends, and wait for that response to finish (`response.finished()` for streams). Stale UI from a previous step can't satisfy it. After that, use the readiness markers Kibana's Scout helpers rely on, then the result-unique assertion above.
- **Wait until an element is ready for input before using it.** Wait for it to be mounted or enabled (Monaco, submit buttons). For the ES|QL editor, `kibanaCodeEditor` alone is not enough before typing: wait for the mounted `.monaco-editor` inside `ESQLEditor`. Never use fixed sleeps.
- **Locators come from what Kibana's own tests use, in this order.**
  1. A `data-test-subj` that Kibana's Scout or FTR page objects use. Renaming one means updating those tests in the same Kibana PR. Check against the Kibana version the journey runs against, not `main`, for example with `gh search code '<id>' --repo elastic/kibana`.
  2. Role plus name, scoped inside a container from (1), for example `getByTestId('agentBuilderWrapper').getByRole('link', { name: 'Overview' })`.
  3. Anything else needs a comment explaining why (1) and (2) don't exist.

  Don't use `xpath=`, CSS-class selectors, `.first()`, `.last()` or `.nth()`. Compose with `getByTestId(...).getByRole(...)` and `.filter({ has })`. A test-subj that holds several space-separated tokens or a prefix (`nav-item-deepLinkId-*`, `agentBuilderAgentsListRow-*`) goes through `page.locator('[data-test-subj~="..."]')` (or `^=` for a prefix) with a comment explaining why.
- **Unstable results.** Journeys retry twice. A journey that passes on a retry is reported as unstable. An unstable result is tracked but doesn't count as a failure by itself. Two unstable runs in a row count as a failure.
- **Burn in before relying on a journey.** A new or changed golden journey must pass 10 consecutive runs against one test cluster:
  1. `npx playwright test --project auth --no-deps`
  2. `npx playwright test <spec> --project journey --no-deps --repeat-each=10 --retries=0 --workers=4`

  Four workers matches the CI parallelism. `--no-deps` skips the report upload.
