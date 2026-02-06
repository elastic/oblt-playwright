import {
  Locator,
  Page,
  expect
} from '@playwright/test';
import {
  ABSOLUTE_TIME_RANGE,
  END_DATE,
  KIBANA_HOST,
  START_DATE,
  TIME_UNIT,
  TIME_VALUE,
} from '../env.ts';

type WaitForRes = [locatorIndex: number, locator: Locator];

export async function waitForOneOf(locators: Locator[]): Promise<WaitForRes> {
  const res = await Promise.race([
    ...locators.map(async (locator, index): Promise<WaitForRes> => {
      let timedOut = false;
      await locator.waitFor({ state: 'visible' }).catch(() => timedOut = true);
      return [timedOut ? -1 : index, locator];
    }),
  ]);
  if (res[0] === -1) {
    throw new Error('No locator is visible before timeout.');
  }
  return res;
}

export async function selectDefaultSpace(
  buildFlavor: string,
  page: Page
) {
  const [index] = await waitForOneOf([
    page.locator('xpath=//nav[@data-test-subj="projectLayoutSideNav"]'),
    page.locator('xpath=//div[@data-test-subj="helpMenuButton"]'),
    page.locator('xpath=//h1[contains(text(),"Select your space")]')
  ]);
  const selector = index === 2;
  if (selector) {
    await page.locator('xpath=//a[contains(text(),"Default")]').click();
    if (buildFlavor === 'default') {
      await expect(page.locator('xpath=//div[@data-test-subj="helpMenuButton"]'), 'Help menu button').toBeVisible();
    } else if (buildFlavor === 'serverless') {
      await expect(page.locator('xpath=//nav[@data-test-subj="projectLayoutSideNav"]'), 'Side navigation panel').toBeVisible();
    } else {
      throw new Error(`Unsupported build flavor: ${buildFlavor}`);
    }
  }
}

export async function testStep(
  title: string,
  stepData: object[],
  page: Page,
  stepFunction: any,
  description?: string,
  ...args: any[]
): Promise<any> {
  const start: string = new Date().toISOString();
  const startTimePerf: number = performance.now();
  try {
    const result: any = await stepFunction.apply(null, [page, ...args]);
    const endTimePerf: number = performance.now();
    const end: string = new Date().toISOString();
    const duration: number = Math.round(endTimePerf - startTimePerf);

    stepData.push({
      [title]: {
        start,
        end,
        duration,
        description,
        status: 'passed'
      }
    });

    return result;
  } catch (error) {
    const end: string = new Date().toISOString();

    stepData.push({
      [title]: {
        start,
        end,
        status: 'failed',
        error: error.message.replace(/\u001b\[[0-9;]*m|\u001b/g, '')
      }
    });

    throw error;
  }
}

export function getDatePickerLogMessage(): string {
  return ABSOLUTE_TIME_RANGE
    ? `Setting the fixed search interval from ${START_DATE} to ${END_DATE}`
    : `Setting the search interval of last ${TIME_VALUE} ${TIME_UNIT}`;
}

export async function checkKibanaAvailability(page: Page) {
  try {
    const response = await page.goto(KIBANA_HOST, {
      timeout: 30000,
      waitUntil: 'domcontentloaded'
    });

    if (!response || !response.ok()) {
      throw new Error(`Kibana is not available. Status: ${response?.status()}`);
    }

    return {
      available: true,
      status: response.status(),
      url: KIBANA_HOST
    };
  } catch (error: any) {
    throw new Error(`Failed to reach Kibana at ${KIBANA_HOST}: ${error.message}`);
  }
}
