# Verified repository facts

Use these facts during the migration. If a source file changes, check the fact
again.

## Journey file selection

`playwright.config.ts` defines:

- the `./tests` test root
- the `journey` project
- the `**/*.journey.spec.ts` match pattern

`README.md` documents:

- the `tests/kibana/product-journeys` location
- a command with `--project journey`

Use `tests/kibana/product-journeys/<name>.journey.spec.ts` for the journey file.

## Journey fixture

`package.json` exports:

- `oblt-playwright/fixtures/journey-fixtures`
- `oblt-playwright/fixtures/page-fixtures`

`src/fixtures/journey-fixtures.ts` defines a fixture that:

- extends the page fixture
- calls `writeJsonReport` after the test body
- exports `test`
- does not export `expect`

Import `test` from the journey fixture. If the journey needs `expect`, import
`expect` from `@playwright/test`.

## Page-object fixture

`src/fixtures/page-fixtures.ts` defines:

- the `Fixtures` type
- the `base.extend` call
- the fixture bodies

`src/pom/base.page.ts` defines `BasePage`. `BasePage` contains the Playwright
`Page` and logger.

For each new fixture, add:

- a `Fixtures` property
- a fixture body

If a page object already has a fixture, do not add another fixture.

## Package exports

`package.json` defines these exports:

- `oblt-playwright/env`;
- the journey and page fixtures;
- `oblt-playwright/pom/base.page`;
- wildcard page and component modules.

Find the package subpath in `package.json`. Then use that package subpath.

## Environment values

`src/env.ts` exports:

- `KIBANA_HOST`;
- `ELASTICSEARCH_HOST`;
- `API_KEY`.

`API_KEY` supports the old input name. `API_KEY` also removes the `ApiKey`
prefix. When the source script needs a value, import the applicable export.

## Test ID configuration

`playwright.config.ts` sets `data-test-subj` as the test ID attribute.

## Lint configuration

`package.json` defines the `lint` and `lint:fix` scripts.

`eslint.config.mjs` defines:

- TypeScript rules that use type information
- Playwright rules for `tests/**/*.ts`
- Playwright rules for `src/setup/**/*.spec.ts`

Run `npx eslint` with each changed TypeScript file. This command excludes
findings in unchanged files. Use the migration diff to classify each finding.
Do not fix unrelated findings.
