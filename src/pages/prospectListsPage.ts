import { Page, Locator } from '@playwright/test';

export class ProspectListsPage {

    readonly page: Page;
    readonly createListButton: Locator;
    readonly lists: Locator;
    readonly actionMenu: Locator;
    readonly newListButton: Locator;
    readonly listNameInput: Locator;
    readonly integrationItems: Locator;
    readonly defaultSwitchLabel: Locator;
    readonly defaultSwitcherCheckbox: Locator;
    readonly limit: Locator;
    readonly webHookNameInput: Locator;
    readonly webHookUrlInput: Locator;
    readonly sendTestButton: Locator;
    readonly closeModalButton: Locator;
    readonly content: Locator;

    constructor(page: Page) {
        this.page = page;
        this.createListButton = page.locator('text=Create List');
        this.actionMenu = page.getByLabel('Actions Menu');
        this.lists = page.locator('div[class="list-item"]');
        this.newListButton = page.locator('button.MuiButton-root', { hasText: 'New List' });
        this.listNameInput = page.getByPlaceholder('List name');
        this.integrationItems = page.locator('div[class="integration-item"]');
        this.defaultSwitchLabel = page.locator('label.default-switch');
        this.limit = page.locator('p.limit', { hasText: 'Max limit: ' });
        this.webHookNameInput = page.locator('div.input-flex-wrapper.input-filled');
        this.webHookUrlInput = page.getByLabel('URL');
        this.sendTestButton = page.getByRole('button', { name: 'Send a Test' });
        this.defaultSwitcherCheckbox = page.locator('label.default-switch input.MuiSwitch-input');
        //this.defaultSwitcherCheckbox = page.getByLabel('is default (only one list can');
        this.closeModalButton = page.locator('div.title-wrapper button.MuiIconButton-root');
        this.content = page.locator('div.content');
    }

    async getStarIconButtonCorrespondingList(isDefault: boolean, listName: string) {
        if (isDefault === true) return (await this.getList(listName)).getByLabel("Default");
        else { return (await this.getList(listName)).getByLabel("Set List to Default"); }
    }

    async getList(listName: string) {
        return this.page.locator(`div[class="list-item"]`, { hasText: listName });
    }

    //Select hidden Action Menu/Edit/Export button
    async getActionsShowOnHover(buttonName: string, listName: string) {
        const list = await this.getList(listName);
        const actionsMenu = list.getByLabel(buttonName);
        return actionsMenu;
    }

    //Select Delete or Clean list item from Action Menu
    async getActionMenuItem(actionName: string) {
        return this.page.locator('li [class="list-actions-menu-item"] p', { hasText: actionName });
    }

    //Select submit delete/clear/add New List button
    async getSubmitButton(buttonName: string) {
        return this.page.locator('button.MuiButton-root', { hasText: buttonName });
    }

    async getIntegrationItemCheckBox(integrationName: string) {
        return this.page.locator('div[class="integration-item"]', { hasText: integrationName }).locator('input[type="checkbox"]');
    }

    async getDefaulSwitchCheckbox() {
        return this.defaultSwitchLabel.locator('input[type="checkbox"]');
    }

    async getWebHookNameInput(nameOfField: string) {
        return this.webHookNameInput.filter({ hasText: nameOfField }).locator('input');
    }
}