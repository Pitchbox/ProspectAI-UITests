import { Page, Locator } from '@playwright/test';

export class GeneralPage {
    readonly page: Page;
    readonly title: Locator;
    readonly popUpNotification: Locator;
    readonly closePopUpNotificationButton: Locator;
    readonly titleModalWindow: Locator;
    readonly filledInput: Locator;
    readonly validationMessage: Locator;
    readonly signInButton: Locator;
    readonly signUpButton: Locator;
    readonly searchInput: Locator;
    readonly addListButton: Locator;
    readonly addToListButton: Locator
    readonly addNewListButton: Locator;
    readonly listNameInput: Locator
    readonly saveListButton: Locator;
    readonly outOfLists: Locator;
    readonly saveButton: Locator;
    readonly cancelButton: Locator;
    readonly selectAllContacts: Locator;
    readonly countOfFoundContacts: Locator;
    readonly nextPage: Locator;
    readonly drawerHeader: Locator;
    readonly inputFile: Locator;
    readonly fileInfo: Locator;
    readonly recognizedEmailCount: Locator;
    readonly chechboxPlusFirstColumn: Locator;
    readonly authMenu: Locator;
    readonly authMenuItem: Locator;
    readonly profileMenuUserData: Locator;
    readonly shareWithFriendsWrapper: Locator;
    readonly backToDoshboard: Locator;
    readonly checkboxes: Locator;
    readonly progressbar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.popUpNotification = this.page.locator('div.mantine-Notification-description');
        this.closePopUpNotificationButton = this.page.locator('button.mantine-Notification-closeButton');
        this.title = this.page.locator('p[class*="title"]');
        this.titleModalWindow = this.page.locator('div.title-wrapper > p');
        this.filledInput = this.page.locator('input.MuiFilledInput-input');
        this.validationMessage = this.page.locator('p.Mui-error');
        this.signInButton = this.page.getByRole('button', { name: "Sign In", exact: true });
        this.signUpButton = this.page.getByRole('button', { name: "Sign up", exact: true });
        this.searchInput = this.page.getByPlaceholder('Search');
        this.addListButton = page.locator('div.select-multiple-chip-value-edit');
        this.addToListButton = page.getByRole('button', { name: 'Add to List' });
        this.addNewListButton = page.locator('div.create-new-list-form');
        this.listNameInput = page.getByPlaceholder("Enter list name");
        this.saveListButton = page.getByLabel('submit');
        this.outOfLists = page.locator('#menu- > .MuiBackdrop-root');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.cancelButton = page.locator('button.MuiButton-root', { hasText: 'Cancel' });
        this.selectAllContacts = page.getByLabel('Press Space to toggle all');
        this.countOfFoundContacts = page.locator('div span[ref="lbRecordCount"]');
        this.nextPage = page.getByLabel('Next Page');
        this.drawerHeader = page.locator('div[class*="drawer"]');
        this.inputFile = page.locator('input[type="file"]');
        this.fileInfo = page.locator('div[class="file-info"]');
        this.recognizedEmailCount = page.locator('div.contacts-found-wrapper > p');
        this.chechboxPlusFirstColumn = page.locator('div.ag-cell-wrapper');
        this.authMenu = page.locator('div.auth-menu-wrapper button');
        this.authMenuItem = page.getByRole('menuitem');
        this.profileMenuUserData = page.locator('div.profile-menu-user-data');
        this.shareWithFriendsWrapper = page.locator('div.share-with-friends-wrapper');
        this.backToDoshboard = page.locator('nav>div[class*="mantine"]', { hasText: 'Dashboard' });
        this.checkboxes = page.locator('input[type="checkbox"]');
        this.progressbar = page.getByRole('progressbar').getByRole('img');
    }

    // /sign-up /reset-password/ sign-in
    async getActionButton(action: string) {
        return this.page.locator(`a[href="/${action}"]`);
    }

    async getTitle(selector: Locator, text: string) {
        return selector.filter({ hasText: text });
    }

    async getMainMenuButton(buttonName: string) {
        return this.page.locator('button.mantine-UnstyledButton-root', { hasText: buttonName });
        //return this.page.getByRole('button', { name: buttonName });
    }

    async getSubMenuButton(subMenuName: string) {
        return this.page.locator("div.mantine-Stack-root").filter({ hasText: subMenuName });
    }

    async selectCorrespondingItem(itemName: string) {
        return this.page.getByRole("option", { name: itemName });
    }

    async getCell(column: string) {
        return this.page.locator(`[class*="${column}-cell"] > p`);
    }

    async getButton(nameButton: string) {
        return this.page.getByRole('button', { name: nameButton, exact: true });
    }

    async getCellByName(email: string, nameColumn: string) {
        const row = await this.getRowByEmail(email);
        return row.locator(`div.ag-cell[col-id="${nameColumn}"]`);
    }

    async getRowByEmail(email: string) {
        return this.page.locator(`div.ag-row`).filter({ hasText: email });
    }

    async getCheckboxByEmail(selector: Locator, email: string) {
        const emailRow = selector.filter({ hasText: email });
        return emailRow.locator('input[type="checkbox"]');
    }

    async getElementByLable(label: string) {
        return this.page.getByLabel(label, { exact: true });
    }
}