import { Browser } from '@playwright/test';
import {
  REPORT_CLUSTER_API_KEY,
  REPORT_CLUSTER_ES,
} from '../env.ts';
import {
  oblt_playwright,
  oblt_playwright_logs
} from '../index-templates.ts';
import { Logger } from "winston";

export async function importDashboards(log: Logger, browser: Browser, inputFile: string) {
  log.info('Checking if Playwright dashboards are available');
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/app/management/kibana/objects');
  await page.locator('xpath=//input[@data-test-subj="savedObjectSearchBar"]').fill('Playwright type:(dashboard)');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  const noItems = await page.locator('xpath=//div[@data-test-subj="savedObjectsTable"]//span[contains(text(), "No items found")]').isVisible();
  if (noItems) {
    log.info('Importing dashboards...');
    await page.getByRole('button', { name: 'Import' }).click();
    await page.locator('xpath=//input[@type="file"]').setInputFiles(inputFile);
    await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Import")]').click();
    await page.locator('xpath=//div[contains(@class, "euiFlyoutFooter")]//span[contains(text(),"Done")]').click();
  } else {
    log.info('Dashboard(s) already exist.');
  }
  await context.close();
}

export async function checkIndexExists(indexName: string): Promise<boolean> {
  const url = `${REPORT_CLUSTER_ES}/${indexName}`;
  const response = await fetch(url, {
    method: 'HEAD',
    headers: {
      'Authorization': `ApiKey ${REPORT_CLUSTER_API_KEY}`,
    },
  });
  return response.ok;
}

export async function checkIndexTemplateExists(templateName: string): Promise<boolean> {
  const url = `${REPORT_CLUSTER_ES}/_index_template/${templateName}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `ApiKey ${REPORT_CLUSTER_API_KEY}`,
    },
  });
  return response.ok;
}

export async function createIndexTemplate(name: string) {
  const url = `${REPORT_CLUSTER_ES}/_index_template/${name}`;
  let template_name: {} = {};
  
  switch (name) {
    case "oblt-playwright":
        template_name = oblt_playwright;
        break;
    case "playwright-logs":
        template_name = oblt_playwright_logs;
        break;
  }

  const body = {
    index_patterns: [`${name}`],
    template: template_name,
  };
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `ApiKey ${REPORT_CLUSTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseBody = await response.json();
    throw new Error(`Failed to create index template. Response: ${JSON.stringify(responseBody)}`);
  }
  return response.ok;
}

export async function createIndex(indexName: string) {
  const url = `${REPORT_CLUSTER_ES}/${indexName}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `ApiKey ${REPORT_CLUSTER_API_KEY}`,
    },
  });
  if (!response.ok) {
    const responseBody = await response.json();
    throw new Error(`Failed to create index. Response: ${JSON.stringify(responseBody)}`);
  }
  return response.ok;
}
