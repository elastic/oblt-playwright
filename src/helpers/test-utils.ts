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

const TIME_UNIT_MAP: Record<string, string> = {
  'Seconds': 's', 'seconds': 's', 's': 's',
  'Minutes': 'm', 'minutes': 'm', 'm': 'm',
  'Hours': 'h', 'hours': 'h', 'h': 'h',
  'Days': 'd', 'days': 'd', 'd': 'd',
  'Weeks': 'w', 'weeks': 'w', 'w': 'w',
  'Months': 'M', 'months': 'M', 'M': 'M',
  'Years': 'y', 'years': 'y', 'y': 'y',
};

/**
 * Builds a Kibana app URL with optional app state (_a) and global time range (_g)
 * encoded in Kibana Rison query params.
 * Uses environment variables (START_DATE/END_DATE or TIME_VALUE/TIME_UNIT) by default.
 * @param appPath - Kibana app path, e.g. '/app/discover'
 * @param appState - Optional Kibana app state, e.g. "(index:'<data-view-id>')"
 */
export function buildKibanaUrl(appPath: string, appState?: string): string {
  let timeFrom: string;
  let timeTo: string;

  if (ABSOLUTE_TIME_RANGE && START_DATE && END_DATE) {
    timeFrom = `'${START_DATE}'`;
    timeTo = `'${END_DATE}'`;
  } else if (TIME_VALUE && TIME_UNIT) {
    const shortUnit = TIME_UNIT_MAP[TIME_UNIT] || TIME_UNIT;
    timeFrom = `now-${TIME_VALUE}${shortUnit}`;
    timeTo = 'now';
  } else {
    timeFrom = 'now-15m';
    timeTo = 'now';
  }

  const appPathNormalized = appPath.replace(/#\/?\?.*$/, '');
  const appStatePart = appState ? `_a=${appState}&` : '';
  return `${appPathNormalized}#/?${appStatePart}_g=(time:(from:${timeFrom},to:${timeTo}))`;
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
