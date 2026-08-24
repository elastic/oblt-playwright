---
name: journey-refactor
description: Migrates working Playwright scripts into this repository's Kibana product-journey suite without changing what they exercise. Creates or updates only the page objects required by the migration.
---

# Migrate a Kibana product journey

Use the source script as the behavior standard. A new journey is new to this
repository. The journey is not a new design.

## Rules

Keep these source items unchanged:

- test boundaries
- action order
- navigation
- assertions
- cleanup
- data dependencies

Follow these additional rules:

- Accept the source locators as valid.
- Move the locators without a behavior change.
- Change only the page objects that the migration needs.
- Do not change shared configuration.
- Do not do unrelated cleanup.
- Before you propose improvements, complete the migration.

Before you edit files, read these references:

- [references/migration.md](references/migration.md)
- [references/page-objects.md](references/page-objects.md)
- [references/repo-facts.md](references/repo-facts.md)

## 1. Record the source behavior

Read the complete source script. Make a behavior list.

Record these items:

- each test and hook boundary
- each state dependency
- each navigation and user action in source order
- each locator with its selector string, filters, options, chains, and indexes
- each assertion and timeout
- input data and generated identifiers
- environment variables and helpers
- setup, teardown, and failure cleanup

Do not change the source design. Use the behavior list to review the migration.

## 2. Before you create a page object, compare existing ones

Search `src/pom` for each applicable UI surface and interaction. Extend the
page object that owns the surface. If no page object owns the surface, create a
page object.

If two locators target the same element, compare the locators. If the locators
are different, stop work on that interaction.

Give the user this information:

- the source locator and its file path
- each source action or assertion that uses the locator
- the page-object locator and its file path
- each repository call site that uses the related method
- the interaction that both locators represent

Ask the user which locator to keep.

Do not combine the locators.

Without a user decision, do not:

- choose a locator
- replace a locator

If the locators are the same, use the existing method.

## 3. Add the journey file to the suite

Use [references/migration.md](references/migration.md).

Add the journey file:

- Create `tests/kibana/product-journeys/<name>.journey.spec.ts`.
- Import `test` from `oblt-playwright/fixtures/journey-fixtures`.

Keep this source structure:

- each independent scenario in an independent test
- dependent phases in one test

When named `test.step` blocks make the trace clearer, use named `test.step`
blocks. Change only the repository integration points that occur in the source.

Do not add:

- an unnecessary helper
- a reporting call

Do not change an environment variable that the migration does not use.

Without a deletion request, keep the source script. Without a replacement
request, do not overwrite the source script.

## 4. Move the required behavior into page objects

Use [references/page-objects.md](references/page-objects.md).

Keep these items unchanged:

- each locator's selector string, option, filter, scope, chain, and index
- the order of each action and assertion
- the set of actions and assertions
- test data and expected values

Extend the page object that owns the UI surface.

Register each new fixture in both locations:

- the `Fixtures` type
- the fixture body in `src/fixtures/page-fixtures.ts`

Pass variable values to page-object methods as parameters.

Compare these items with the behavior list:

- each moved locator
- each moved action sequence

## 5. Verify

Replace each uppercase name with an applicable name. Add every changed
TypeScript file to the lint command. Run both commands.

```bash
npx eslint tests/kibana/product-journeys/JOURNEY.journey.spec.ts src/pom/pages/PAGE.page.ts src/fixtures/page-fixtures.ts
npx playwright test tests/kibana/product-journeys/JOURNEY.journey.spec.ts --project journey
```

If a command fails, identify the cause. First, compare the failure with the
migration diff.

Then check:

- the locators
- the action order and test boundaries
- the setup and cleanup

A lint finding can exist before the migration. Do not fix unrelated findings.
After each correction, run the failed command again.

After a Playwright failure, read `test-results/<dir>/error-context.md` only to
diagnose the failure. Do not redesign a source locator from the failure
artifact.

If the environment or data is not available, report:

- the exact command
- the failure
- all behavior that you could not verify

Do not report a pass.

## 6. Report the result

Report:

- the journey file path
- each page object that you used, changed, or created
- the locator comparison result
- each verification command and its result
- each unresolved problem
- all behavior that you could not verify
- optional improvements as later work

The migration is complete only when:

- The journey contains each item in the behavior list.
- The user made each required locator decision.
- Each new fixture has a type entry and a fixture body.
- Verification passed, or an environment problem prevented verification.
