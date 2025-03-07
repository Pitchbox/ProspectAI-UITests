import { Page, expect } from '@playwright/test';
import { ProspectListsPage } from '../pages/prospectListsPage';
import { GeneralPage } from '../pages/generalPage';
import { GeneralStep } from './generalStep';

export class ProspectListsStep {
    readonly page: Page
    readonly pageLocators: ProspectListsPage;
    readonly generalPage: GeneralPage;
    readonly generalStep: GeneralStep;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new ProspectListsPage(page);
        this.generalPage = new GeneralPage(page);
        this.generalStep = new GeneralStep(page);

    }

    //#region 🔹 Navigation 
    async openList(listName: string) {
        const list = this.pageLocators.lists.filter({ hasText: listName });
        await expect(list).toBeVisible();
        await list.click();
    }

    async hoverTheList(listName: string) {
        const list = this.pageLocators.lists.filter({ hasText: listName });
        await expect(list).toBeVisible();
        await list.hover();
    }

    //#endregion

    //#region 🔹 Actions
    async cleanUpDeleteList(listName: string, actionName: string) {
        await this.hoverTheList(listName);
        const actionMenuButton = await this.pageLocators.getActionsShowOnHover('Actions Menu', listName);//Buttons Action menu       
        await actionMenuButton.focus();
        await actionMenuButton.click();// click on the action menu
        expect(await this.pageLocators.getActionMenuItem(actionName)).toBeVisible();
        await (await this.pageLocators.getActionMenuItem(actionName)).click();//select from dropdown "Delete List" or "Clean List" the list
        const actionButton = await this.pageLocators.getSubmitButton(actionName.replace(' List', ''));//select submit delete/clear
        await this.generalStep.expectModalIsShown(`Are you sure you want to ${actionName.replace(' List', '')} "${listName}" list?`);
        expect(actionButton).toBeVisible();
        await actionButton.click();//click on the submit button on modal window
    }

    async clickOnEditListButton(listName: string) {
        await this.hoverTheList(listName);
        const editButton = await this.pageLocators.getActionsShowOnHover('Edit', listName);//Buttons Edit
        await editButton.focus();
        await editButton.click();
    }

    async exportTheList(filePath: string, listName: string) {

        await this.hoverTheList(listName);
        const exportButton = await this.pageLocators.getActionsShowOnHover('Export', listName);//Buttons Export
        await exportButton.focus();

        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            await exportButton.click()
        ]);

        await download.saveAs(filePath);
    }

    async getCountOfLists() {
        const lists = this.pageLocators.lists;
        await lists.first().waitFor({ state: 'visible' });
        return await lists.count();
    }

    async getAllTestLists(text: string) {
        const lists = this.pageLocators.lists;
        await lists.filter({ hasText: 'Address book' }).waitFor({ state: 'visible' });
        return (await lists.allInnerTexts())
            .filter((list) => list && list.includes(text)) // filter out empty strings
            .map((list) => (list.includes('\n') ? list.split('\n')[0] : list));
    };

    async createList(list: string, index?: number) {
        await this.clickOnNewListButton();
        await this.generalStep.expectModalIsShown('Create List');
        await this.pageLocators.listNameInput.fill(list + index);
        await (this.generalPage.saveButton).click();
    }

    async updateList(listName: string) {
        await this.pageLocators.listNameInput.clear();
        await this.pageLocators.listNameInput.fill(listName);
    }

    async clickOnSaveButton() {
        await (this.generalPage.saveButton).click();
    }

    async clickOnCancelButton() {
        await this.generalPage.cancelButton.click();
    }

    async clickOnNewListButton() {
        await this.pageLocators.newListButton.click();
        await this.generalStep.expectModalIsShown('Create List');
    }

    async setListAsDefault(listName: string) {
        const list = await this.pageLocators.getList(listName);
        await list.hover();
        const starIconButton = await this.pageLocators.getStarIconButtonCorrespondingList(false, listName);
        await starIconButton.click();
    }

    async switchOnDefaultListChexbox() {
        const switcher = this.pageLocators.defaultSwitcherCheckbox;
        await expect(switcher).toBeEnabled();
        await switcher.check({ force: true });
        await expect(switcher).toBeChecked();
    }

    async switchOnIntegrationItemCheckBox(integrationName: string) {
        await (await this.pageLocators.getIntegrationItemCheckBox(integrationName)).click();
    }

    async fillWebHookName(name: string) {
        const inputName = this.pageLocators.getWebHookNameInput('Name');
        await (await inputName).isVisible();
        await (await inputName).fill(name, { timeout: 10000 });
    }

    async fillWebHookUrl(url: string) {
        const inputUrl = this.pageLocators.getWebHookNameInput('URL');
        await (await inputUrl).isVisible();
        await (await inputUrl).fill(url, { timeout: 10000 });
    }

    async clickOnSendTestButton() {
        await this.pageLocators.sendTestButton.click({ timeout: 10000 });
    }

    async clickOnTheList(listName: string) {
        await (await this.pageLocators.getList(listName)).click({ timeout: 10000 });
    }

    async closeTheModal() {
        await this.pageLocators.closeModalButton.click({ timeout: 10000 });
    }

    //#endregion

    //#region 🔹 Expectations
    async expectCountOfListsArePresented(count: number) {
        await expect(this.pageLocators.lists).toHaveCount(count);
    }

    async expectListsArePresented(lists: string[]) {
        for (const list of lists) {
            await expect(this.pageLocators.lists.filter({ hasText: list })).toBeVisible();
        }
    }

    async expectListsAreNotPresented(nameOfList: string) {
        const lists = this.pageLocators.lists;
        await lists.filter({ hasText: 'Address book' }).waitFor({ state: 'visible' });
        for (const list of await lists.allInnerTexts()) {
            expect(list).not.toContain(nameOfList);
        }
    }

    async expectListIsDefault(listName: string) {
        const list = await this.pageLocators.getList(listName);
        await list.hover();
        const starIconButton = await this.pageLocators.getStarIconButtonCorrespondingList(true, listName);
        await expect(starIconButton).toBeVisible();
    }

    async expectDefaultListShouldBeOne() {
        const starIcon = this.pageLocators.lists.getByLabel("Default", { exact: true });
        await expect(starIcon).toHaveCount(1);
    }

    async expectTitleMaxLimitIsPresented() {
        const text = await this.pageLocators.limit.innerText();
        expect(text.replace(/\n/g, " ")).toContain("Max limit: 5");
    }

    async expectNewListButtonIsDisabled() {
        await expect(this.pageLocators.newListButton).toBeDisabled();
    }
    //#endregion
}