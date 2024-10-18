import { Locator } from '@playwright/test';
import HeaderBar from '../tests/stateful/pom/components/header_bar.component';
import SideNav from '../tests/serverless/pom/components/side_nav.component';
import { SpaceSelector as SpaceSelectorStateful } from '../tests/stateful/pom/components/space_selector.component';
import { SpaceSelector as SpaceSelectorServerless } from '../tests/serverless/pom/components/space_selector.component';

type WaitForRes = [ locatorIndex: number, locator: Locator ];

export async function waitForOneOf(locators: Locator[]): Promise<WaitForRes> {
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

export async function spaceSelectorStateful(headerBar: HeaderBar, spaceSelector: SpaceSelectorStateful) {
  const [ index ] = await waitForOneOf([
    headerBar.logo(),
    spaceSelector.spaceSelector()
    ]);
  const selector = index === 1;
  if (selector) {
      await spaceSelector.selectDefault();
      await headerBar.assertLogo();
    };
}

export async function spaceSelectorServerless(sideNav: SideNav, spaceSelector: SpaceSelectorServerless) {
  const [ index ] = await waitForOneOf([
    sideNav.sideNav(),
    spaceSelector.spaceSelector(),
    ]);
  const selector = index === 1;
  if (selector) {
    await spaceSelector.selectDefault();
    await sideNav.assertSideNav();
    };
}