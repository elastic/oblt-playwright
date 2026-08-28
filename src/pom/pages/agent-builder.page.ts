import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

export type AgentDefinition = {
    id: string;
    displayName: string;
    description: string;
    instructions: string;
};

export default class AgentBuilderPage extends BasePage {

    private readonly pageControls = () => this.page.getByLabel('Page level controls');
    private readonly agentSelectorButton = () => this.page.getByTestId('agentBuilderAgentSelectorButton');
    private readonly manageAgentsLink = () => this.page.getByRole('link', { name: 'Manage agents' });
    private readonly newAgentLink = () => this.page.getByRole('link', { name: 'New agent' });
    private readonly agentIdInput = () => this.page.getByRole('textbox', { name: 'Agent ID input field' });
    private readonly agentNameInput = () => this.page.getByRole('textbox', { name: 'Agent display name input field' });
    private readonly agentDescriptionInput = () => this.page.getByRole('textbox', { name: 'Agent display description' });
    private readonly instructionsInput = () => this.page.getByRole('textbox', { name: 'Custom Instructions' });
    private readonly pageControlsSaveButton = () => this.pageControls().getByRole('button', { name: 'Save', exact: true });
    private readonly settingsSaveButton = () => this.page.getByTestId('editDetailsSaveButton');
    private readonly editSettingsButton = () => this.page.getByRole('button', { name: 'Edit agent settings' });
    private readonly chatTab = () => this.pageControls().getByRole('button', { name: 'Chat', exact: true });
    private readonly overviewTab = () => this.page.getByRole('link', { name: 'Overview' });
    private readonly agentsList = () => this.page.getByRole('main', { name: 'Agent Builder agents list' });
    private readonly agentSearchInput = () => this.agentsList().getByRole('searchbox');
    private readonly agentsTable = () => this.agentsList().getByRole('table');
    private readonly agentLink = (name: string) => this.page.getByRole('link', { name, exact: true });
    private readonly agentRow = (name: string) => this.page.getByRole('row').filter({ has: this.agentLink(name) });
    private readonly rowActionsButton = (name: string) => this.agentRow(name).getByRole('button', { name: /All actions/ });
    private readonly actionsMenuDeleteButton = () => this.page.getByRole('menu').getByRole('button', { name: 'Delete', exact: true });
    private readonly deleteConfirmButton = (name: string) => this.page
        .getByRole('alertdialog', { name: `Delete ${name}` })
        .getByRole('button', { name: 'Delete', exact: true });
    private readonly conversationInput = () => this.page.getByTestId('agentBuilderConversationInputEditor');
    private readonly submitPromptButton = () => this.page.getByRole('button', { name: 'Submit', exact: true });
    private readonly assistantResponse = () => this.page.getByLabel('Assistant response').last();
    private readonly regenerateResponseButton = () => this.page.getByTestId('roundResponseRegenerateButton').last();

    public async openManageAgents() {
        this.log.info('Opening the agent list');
        await this.agentSelectorButton().click();
        await this.manageAgentsLink().click();
    }

    public async createAgent(agent: AgentDefinition) {
        this.log.info(`Creating the "${agent.displayName}" agent with ID "${agent.id}"`);
        await this.newAgentLink().click();
        await this.agentIdInput().fill(agent.id);
        await this.instructionsInput().fill(agent.instructions);
        await this.agentNameInput().fill(agent.displayName);
        await this.agentDescriptionInput().fill(agent.description);
        await this.pageControlsSaveButton().click();
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

    public async assertAgentListed(name: string) {
        await expect(this.agentLink(name), `"${name}" agent`).toBeVisible();
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

    public async sendPrompt(prompt: string) {
        this.log.info(`Sending the prompt "${prompt}"`);
        await this.conversationInput().fill(prompt);
        await expect(this.submitPromptButton(), 'Submit prompt button').toBeEnabled();
        await this.submitPromptButton().click();
    }

    public async assertResponseContains(text: string, timeout: number) {
        await expect(this.assistantResponse(), 'Assistant response').toContainText(text, { timeout });
    }

    public async assertResponseCompleted() {
        await expect(this.regenerateResponseButton(), 'Regenerate response button').toBeVisible();
    }

    public async updateInstructions(instructions: string) {
        this.log.info('Updating the agent custom instructions');
        await this.editSettingsButton().click();
        await this.instructionsInput().fill(instructions);
        await this.settingsSaveButton().click();
    }

    public async assertInstructions(instructions: string) {
        await this.editSettingsButton().click();
        await expect(this.instructionsInput(), 'Agent custom instructions').toHaveValue(instructions);
    }

    public async deleteAgent(name: string) {
        this.log.info(`Deleting the "${name}" agent`);
        await this.agentRow(name).hover();
        await this.rowActionsButton(name).click();
        await this.actionsMenuDeleteButton().click();
        await this.deleteConfirmButton(name).click();
    }

    public async assertAgentDeleted(name: string) {
        await expect(this.agentRow(name), `"${name}" agent row`).toBeHidden();
    }
}
