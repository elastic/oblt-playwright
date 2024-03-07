import { Locator } from '@playwright/test';

type WaitForRes = [ locatorIndex: number, locator: Locator ];

export async function waitForOneOf(
  locators: Locator[],
): Promise<WaitForRes> {
  const res = await Promise.race([
    ...locators.map(async (locator, index): Promise<WaitForRes> => {
      let timedOut = false;
      await locator.waitFor({ state: 'visible' }).catch(() => timedOut = true);
      return [ timedOut ? -1 : index, locator ];
    }),
  ]);
  if (res[0] === -1) {
    throw new Error('No locator is visible before timeout.');
  }
  return res;
}