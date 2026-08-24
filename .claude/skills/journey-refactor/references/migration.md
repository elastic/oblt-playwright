# Journey integration

Use this reference to add an existing script to the repository. Keep the source
behavior unchanged.

## Suite configuration

`playwright.config.ts` defines:

- the `journey` project name
- the `**/*.journey.spec.ts` match pattern

`package.json` exports `oblt-playwright/fixtures/journey-fixtures`.

`src/fixtures/journey-fixtures.ts` defines:

- an extension of the shared page fixtures
- automatic test-result output after each test

`README.md` gives the command for the `journey` project.

Do not use these facts to change the source scenario.

## Create the journey file

1. Copy the source script to
   `tests/kibana/product-journeys/<name>.journey.spec.ts`.
2. If the source uses JavaScript, make the TypeScript changes that the
   destination file needs.
3. Make the changes that the lint rules require.

Do not replace:

- a working Playwright operation
- custom setup

Keep these source items unchanged:

- each hook and test boundary
- the action order
- each assertion and cleanup action
- generated test data

Keep the source script for the final comparison.

## Use the journey fixture

Import `test` from the journey fixture:

```ts
import { test } from 'oblt-playwright/fixtures/journey-fixtures';
```

If the journey file has direct assertions, import `expect` from
`@playwright/test`. Do not add a JSON report call. The journey fixture writes
the report.

## Keep the scenario structure

Keep this source structure:

- an independent source scenario in an independent test
- dependent source phases in one test

When named `test.step` blocks make the trace clearer, use named `test.step`
blocks.

Do not:

- merge independent source scenarios
- split stateful source behavior into separate tests

## Keep navigation and lifecycle behavior

Keep these source items:

- navigation route
- navigation method
- scope of each hook
- setup and teardown order
- API setup and cleanup
- generation of unique values
- data that phases share
- branches that support valid start states

Do not replace UI navigation with a direct URL.

Move repository UI interactions into page objects. When you move an
interaction, keep all behavior.

## When the source uses old environment variables, change the imports

`package.json` exports `oblt-playwright/env`. `src/env.ts` exports
`KIBANA_HOST`, `ELASTICSEARCH_HOST`, and `API_KEY`.

If the source script uses the old variable, make these changes:

- `KIBANA_URL` to an import of `KIBANA_HOST`
- `ELASTICSEARCH_URL` to an import of `ELASTICSEARCH_HOST`
- direct `ELASTICSEARCH_API_KEY` access to an import of `API_KEY`

Use this confirmed import form for an applicable value:

```ts
import { KIBANA_HOST } from 'oblt-playwright/env';
```

`API_KEY` accepts `ELASTICSEARCH_API_KEY` as a fallback. `API_KEY` also removes
an `ApiKey` prefix. Do not add the same operation to the journey.

## Review the migration

Before you move behavior into page objects, compare the journey file with the
source script.

Verify these results:

- the journey contains each source scenario and assertion
- the action order is unchanged
- the setup and cleanup order is unchanged
- navigation covers the same UI path
- each locator expression is unchanged
- each repository integration change is identified
