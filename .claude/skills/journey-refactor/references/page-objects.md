# Page-object extraction

Move only the UI behavior that the journey needs. The source script defines the
behavior. Page objects give the behavior an owner.

## Find the owner

Before you create a class or method, search all of `src/pom`.

Use these ownership rules:

- Put page behavior in the page object that owns the UI.
- Put UI behavior that multiple pages share in a component under
  `src/pom/components`.
- Extend the page object or component that owns the same UI surface.
- Do not create a second page object or component for the same UI surface.

Search declarations and call sites. If two locators target the same element,
use the decision procedure in `SKILL.md`.

Show:

- both locator expressions
- each definition
- each known use site

Wait for the user to select a locator.

A similar method name does not prove that two locators are equivalent.

## Move locators without change

When you move a locator, change only the receiver from `page` to `this.page`.

Keep these locator parts:

- selector strings and regular expressions
- role, name, exactness, and visibility options
- all other locator options
- parent scope
- locator chain order
- each `filter`, `first`, `last`, and `nth` call
- each explicit timeout and its position

Do not make these locator changes:

- add `exact: true`
- add a container scope
- change the locator method
- change an index

## Move interaction methods without change

Keep all actions and assertions in their source order.

Do not:

- add an assertion before an action
- replace UI navigation with a direct URL
- merge sequences that only appear equivalent
- remove a branch that supports a valid start state

Make each move small. Compare each move directly with the source script.

## Use the repository page-object form

`BasePage` contains the Playwright `Page` and logger. See
`src/pom/base.page.ts`.

For a new page object:

- Export the class as the default export.
- Extend `BasePage`.
- Put locator functions on the class.
- Use public asynchronous methods for user actions.
- Start assertion method names with `assert`.
- Write a log message for a significant action.

If you extend a page object, use its current form. Do not copy methods or
locators from another page object.

Keep scenario data in the journey file. If a value changes between runs, pass
the value to the page-object method. Put the value in the same locator or
action position.

## Move assertions

When the page object owns the UI, move the assertion with its locator.

Keep these assertion parts unchanged:

- matcher
- expected value
- options
- timeout

Start a new assertion method name with `assert`.

Do not add an assertion that the source did not perform.

## Add new fixtures

The shared `test` uses the `Fixtures` type with `base.extend`. See
`src/fixtures/page-fixtures.ts`.

For each new page-object fixture:

1. Import the class in `src/fixtures/page-fixtures.ts`.
2. Add the typed property to `Fixtures`.
3. Add the fixture body to `base.extend`.
4. Construct the class with `page` and `log`.

If the page object already has a fixture, do not add another fixture.

## Review the move

Compare the result with the source script and behavior list.

Verify these results:

- each raw locator has one owner
- each locator has the same match behavior
- each method keeps the source action order
- methods receive variable values as parameters
- the journey uses fixtures for moved interactions
- each new fixture has both registrations

Defer each intentional locator or interaction change. Give separate evidence
for that change.
