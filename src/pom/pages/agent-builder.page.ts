import { expect, Response } from "@playwright/test";
import { BasePage } from "../base.page";

export type AgentDefinition = {
    id: string;
    displayName: string;
    description: string;
    instructions: string;
};

// The UI calls this route under /api/chat while the server registers it under
// /api/agent_builder, so match on the end of the path.
const isConverseResponse = (response: Response) =>
    response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/converse/async');

export default class AgentBuilderPage extends BasePage {

    private converseResponse?: Response;

    private readonly pageControls = () => this.page.getByLabel('Page level controls');
    private readonly agentSelectorButton = () => this.page.getByTestId('agentBuilderAgentSelectorButton');
    private readonly manageAgentsLink = () => this.page.getByRole('link', { name: 'Manage agents' });
    private readonly newAgentLink = () => this.page.getByRole('link', { name: 'New agent' });
    private readonly agentIdInput = () => this.page.getByTestId('agentSettingsIdInput');
    private readonly agentNameInput = () => this.page.getByTestId('agentSettingsDisplayNameInput');
    private readonly agentDescriptionInput = () => this.page.getByTestId('agentSettingsDescriptionInput');
    // The create form has no test-subj for the instructions field, and Kibana's own
    // page object only sets instructions through the edit flyout.
    private readonly createInstructionsInput = () => this.page.getByRole('textbox', { name: 'Custom Instructions' });
    // The form renders this button in the page body and again in the page controls.
    private readonly createSaveButton = () => this.pageControls().getByTestId('agentFormSaveButton');
    private readonly editDetailsButton = () => this.page.getByTestId('agentOverviewEditDetailsButton');
    private readonly editDetailsFlyout = () => this.page.getByTestId('editDetailsFlyout');
    private readonly instructionsInput = () => this.editDetailsFlyout().getByTestId('editDetailsInstructionsInput');
    private readonly settingsSaveButton = () => this.editDetailsFlyout().getByTestId('editDetailsSaveButton');
    private readonly chatTab = () => this.pageControls().getByRole('button', { name: 'Chat', exact: true });
    private readonly overviewTab = () => this.page.getByTestId('agentBuilderWrapper').getByRole('link', { name: 'Overview' });
    private readonly agentsList = () => this.page.getByTestId('agentBuilderAgentsListContent');
    private readonly agentSearchInput = () => this.agentsList().getByRole('searchbox');
    private readonly agentsTable = () => this.agentsList().getByRole('table');
    private readonly agentLink = (name: string) => this.agentsList().getByRole('link', { name, exact: true });
    private readonly agentRow = (id: string) => this.page.getByTestId(`agentBuilderAgentsListRow-${id}`);
    private readonly rowActionsButton = (id: string) => this.agentRow(id).getByTestId('euiCollapsedItemActionsButton');
    private readonly actionsMenuDeleteButton = (id: string) => this.page.getByTestId(`agentBuilderAgentsListDelete-${id}`);
    private readonly deleteConfirmButton = () => this.page.getByTestId('agentBuilderAgentDeleteConfirmButton');
    private readonly conversationInput = () => this.page.getByTestId('agentBuilderConversationInputEditor');
    private readonly submitPromptButton = () => this.page.getByTestId('agentBuilderConversationInputSubmitButton');
    private readonly assistantResponse = () => this.page.getByTestId('agentBuilderResponseMessage');

    public async openManageAgents() {
        this.log.info('Opening the agent list');
        await this.agentSelectorButton().click();
        await this.manageAgentsLink().click();
    }

    public async createAgent(agent: AgentDefinition) {
        this.log.info(`Creating the "${agent.displayName}" agent with ID "${agent.id}"`);
        await this.newAgentLink().click();
        await this.agentIdInput().fill(agent.id);
        await this.createInstructionsInput().fill(agent.instructions);
        await this.agentNameInput().fill(agent.displayName);
        await this.agentDescriptionInput().fill(agent.description);
        await this.createSaveButton().click();
    }

    /**
     * The list paginates at ten rows, so a newly created agent is often not on
     * the first page. Filter before asserting on or acting through a row.
     */
    public async filterAgents(name: string) {
        this.log.info(`Filtering the agent list by "${name}"`);
        const search = this.agentSearchInput();
        await search.fill('');
        await search.pressSequentially(name);
        await search.press('Enter');
        await expect(this.agentsTable(), 'Filtered agent list').toContainText(name, { timeout: 30000 });
    }

    public async assertAgentListed(id: string) {
        await expect(this.agentRow(id), `"${id}" agent row`).toBeVisible();
    }

    public async openAgent(name: string) {
        this.log.info(`Opening the "${name}" agent`);
        await this.agentLink(name).click();
    }

    public async openChatTab() {
        await this.chatTab().click();
    }

    public async openOverviewTab() {
        await this.overviewTab().click();
    }

    /**
     * Keeps the converse response this click triggers, so `assertResponseCompleted`
     * checks this prompt's response and not one left over from an earlier step.
     */
    public async sendPrompt(prompt: string) {
        this.log.info(`Sending the prompt "${prompt}"`);
        await this.conversationInput().fill(prompt);
        await expect(this.submitPromptButton(), 'Submit prompt button').toBeEnabled();
        [this.converseResponse] = await Promise.all([
            this.page.waitForResponse(isConverseResponse),
            this.submitPromptButton().click(),
        ]);
    }

    public async assertResponseContains(text: string, timeout: number) {
        await expect(this.assistantResponse(), 'Assistant response').toContainText(text, { timeout });
    }

    public async assertResponseCompleted() {
        if (!this.converseResponse) {
            throw new Error('assertResponseCompleted was called before a prompt was sent');
        }
        expect(this.converseResponse.status(), 'Converse request status').toBe(200);
        // finished() resolves to null once the whole stream was received.
        expect(await this.converseResponse.finished(), 'Converse response stream').toBeNull();
    }

    public async updateInstructions(instructions: string) {
        this.log.info('Updating the agent custom instructions');
        await this.editDetailsButton().click();
        await this.instructionsInput().fill(instructions);
        await this.settingsSaveButton().click();
    }

    public async assertInstructions(instructions: string) {
        await this.editDetailsButton().click();
        await expect(this.instructionsInput(), 'Agent custom instructions').toHaveValue(instructions);
    }

    public async deleteAgent(id: string) {
        this.log.info(`Deleting the "${id}" agent`);
        await this.rowActionsButton(id).click();
        await this.actionsMenuDeleteButton(id).click();
        await this.deleteConfirmButton().click();
    }

    public async assertAgentDeleted(id: string) {
        await expect(this.agentRow(id), `"${id}" agent row`).toBeHidden();
    }
}
