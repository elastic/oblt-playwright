import { test } from 'oblt-playwright/fixtures/journey-fixtures';
import { deleteAgentBuilderAgent } from 'oblt-playwright/helpers/api-client';
import type { AgentDefinition } from 'oblt-playwright/pom/pages/agent-builder.page';

const RESULT_TIMEOUT = 10_000;
const ASSISTANT_RESPONSE_TIMEOUT = 25_000;

// A unique ID keeps a leftover agent from a failed run out of the way of the
// next run, which would otherwise fail on a duplicate agent ID.
const runId = Date.now().toString(36);
const agent: AgentDefinition = {
  id: `hello_world_${runId}`,
  displayName: `Hello World ${runId}`,
  description: 'Test agent',
  instructions: 'When prompted with the phrase "hello world", simply reply "hi"',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/app/observability/overview');
});

test.describe('Agent Builder', () => {
  test.afterEach('Remove the agent', async ({ request, log }) => {
    log.info(`Cleaning up the "${agent.id}" agent`);
    await deleteAgentBuilderAgent(request, agent.id);
  });

  test('Creates, tests, and updates an agent', async ({
    agentBuilderPage,
    notifications,
    sideNav,
  }) => {
    await test.step('Create a new agent', async () => {
      await sideNav.clickAgents();
      await agentBuilderPage.openManageAgents();
      await agentBuilderPage.createAgent(agent);
      await agentBuilderPage.filterAgents(agent.displayName);
      await agentBuilderPage.assertAgentListed(agent.displayName);
    });

    await test.step('Test the new agent', async () => {
      await agentBuilderPage.openAgent(agent.displayName);
      await agentBuilderPage.openChatTab();
      await agentBuilderPage.sendPrompt('hello world');
      await agentBuilderPage.assertResponseContains('hi', ASSISTANT_RESPONSE_TIMEOUT);
      await agentBuilderPage.assertResponseCompleted();
    });

    await test.step('Update the new agent', async () => {
      await agentBuilderPage.openOverviewTab();
      await agentBuilderPage.updateInstructions(
        'When prompted with the phrase "hello world", simply reply "hi" and nothing else.',
      );
      await notifications.assertToast('Agent details updated');
    });

    await test.step('Delete the agent', async () => {
      await agentBuilderPage.openManageAgents();
      await agentBuilderPage.filterAgents(agent.displayName);
      await agentBuilderPage.deleteAgent(agent.displayName);
      await agentBuilderPage.assertAgentDeleted(agent.displayName);
    });
  });
});

test.describe('PromQL', () => {
  test('Runs a PromQL query in Discover', async ({ discoverPage, sideNav }) => {
    await sideNav.clickDiscover();
    await discoverPage.switchToEsqlMode();
    await discoverPage.runEsqlQuery(
      'PROMQL index=metrics-* start=?_tstart end=?_tend step=5m sum by (region) (rate(metrics.http_requests_total[5m]))',
    );

    await discoverPage.assertVisibilityResultValue('trading-na', RESULT_TIMEOUT);
    await discoverPage.assertVisibilityResultValue('trading-emea', RESULT_TIMEOUT);
    await discoverPage.assertVisibilityResultChart(RESULT_TIMEOUT);
  });
});
