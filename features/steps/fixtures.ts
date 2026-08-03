import { mergeTests } from '@playwright/test';
import { test as bddTest, createBdd } from 'playwright-bdd';
import { test as pomTest } from 'oblt-playwright/pom/page-fixtures';

// Merges playwright-bdd's Given/When/Then fixtures with the project's page objects,
// so step definitions can use both. All step files must import Given/When/Then from
// here (not from 'playwright-bdd' directly) so bddgen can resolve a single `test`.
export const test = mergeTests(bddTest, pomTest);

export const { Given, When, Then, Before, After } = createBdd(test);
