import { test } from '@playwright/test';
import type { TestInfo } from '@playwright/test';

/**
 * Wraps `test.step` and records the outcome on `testInfo.annotations`, which the
 * reporting fixture reads to name the failing step.
 *
 * Each state marks a different outcome:
 * - `failed` - the step threw.
 * - `running` - a test timeout interrupted the step, so neither the `catch` nor
 *   the line after `test.step` ever ran.
 * - `passed` - the failure happened outside every step, such as in fixture
 *   teardown, and no step should be named.
 */
export async function journeyStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  const annotation = { type: 'journey-step:running', description: title };
  test.info().annotations.push(annotation);

  try {
    const result = await test.step(title, body);
    annotation.type = 'journey-step:passed';
    return result;
  } catch (error) {
    annotation.type = 'journey-step:failed';
    throw error;
  }
}

export function findFailingStep(testInfo: TestInfo): string | undefined {
  const failed = testInfo.annotations.find((a) => a.type === 'journey-step:failed');
  const running = testInfo.annotations.findLast((a) => a.type === 'journey-step:running');

  return (failed ?? running)?.description;
}
