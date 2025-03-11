import { Page, expect } from '@playwright/test';
import { GeneralPage } from '../pages/generalPage';
import * as fs from 'fs';
import csvParser from 'csv-parser';

export class GeneralStep {
    readonly page: Page;
    readonly pageLocators: GeneralPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new GeneralPage(page);
    }

    //#region 🔹 Navigation 
    async open() {
        await this.page.goto('https://app.prospectailabs.com/');
    }

    async goBackInBrowser() {
        await this.page.goBack();
        await this.page.waitForLoadState();
    }
    //#endregion

    //#region 🔹 Actions
    async readCsv(filePath: string, searchItem: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const items: string[] = [];
            console.log(`Path to file ${filePath}`);

            fs.createReadStream(filePath, { encoding: 'utf8' })
                .pipe(csvParser({
                    separator: ','
                }))
                .on('data', (row) => {
                    console.log('Row', row);

                    if (row.Email && searchItem === 'Email') {
                        const email = row.Email.trim().replace(/['"]+/g, '');
                        items.push(email);
                    }

                    if (row.Organization && searchItem === 'Company') {
                        const companyName = row.Organization.trim().replace(/['"]+/g, '');
                        items.push(companyName);
                    }
                })
                .on('end', () => {
                    console.log(' Finded email:', items);
                    resolve(items);
                })
                .on('error', (error) => {
                    console.error(' Error reading CSV:', error);
                    reject(error);
                });
        });
    }

    // action: /sign-up /reset-password/ sign-in
    async clickOnActionButton(action: string) {
        const actionButton = await this.pageLocators.getActionButton(action);
        await actionButton.isVisible();
        await actionButton.click();
    }

    async clickOnButton(buttonName: string) {
        const button = await this.pageLocators.getButton(buttonName);
        await button.click();
    }

    async fillInEntity(entity: string) {
        await this.pageLocators.filledInput.fill(entity);
    }

    async clickOnSignInButton() {
        await this.pageLocators.signInButton.click();
    }

    async clickOnSignUpButton() {
        await this.pageLocators.signUpButton.click();
        await this.page.waitForLoadState();
    }

    async clickOnMainMenuButton(buttonName: string, subMenuName?: string) {
        const mainMenuButton = await this.pageLocators.getMainMenuButton(buttonName);

        if (subMenuName) {
            const subMenuButton = await this.pageLocators.getSubMenuButton(subMenuName);
            if (await subMenuButton.isVisible()) {
                await subMenuButton.click({ timeout: 10000 });
            }
            else {
                await mainMenuButton.click();
                await subMenuButton.click({ timeout: 10000 });
            }
        }
        else {
            await mainMenuButton.click();
        }
    }

    async clickOnSubMenuButton(subMenuName: string) {
        const subMenuButton = await this.pageLocators.getSubMenuButton(subMenuName);
        if (await subMenuButton.isVisible()) {
            await subMenuButton.click({ timeout: 10000 });
        }
    }

    async openAuthMenu() {
        const authMenuButton = this.pageLocators.authMenu;
        await authMenuButton.click({ timeout: 10000 });
    }

    async clickOnSubAuthMenuButton(menuItemName: string, subMenuName?: string) {
        const subMenuButton = this.pageLocators.authMenuItem.filter({ hasText: menuItemName });
        await subMenuButton.click({ timeout: 10000 });

        if (subMenuName) {
            const subMenuBut = this.pageLocators.authMenuItem.filter({ hasText: subMenuName });
            if (await subMenuBut.isVisible()) {
                await subMenuBut.click({ timeout: 10000 });
            }
        }
    }

    async closePopUpNotification() {
        await this.pageLocators.closePopUpNotificationButton.click();
    }

    async uploadFile(filePath: string) {
        await this.pageLocators.inputFile.setInputFiles(filePath);
    }

    async deleteTheDownloadedFile(path: string) {
        if (path) {
            fs.unlinkSync(path);
        }
    }

    async waitForResponse(text: string) {
        await this.page.waitForResponse(response =>
            response.url().includes(`search=${text}`) && response.status() === 200
        );
    }

    async waitForProgressBarIsHidden() {
        await this.pageLocators.progressbar.waitFor({ state: 'hidden' });
    }

    async selectAllItems() {
        await this.pageLocators.selectAllContacts.click();
    }

    async getCountOfFoundContacts() {
        const count = await this.pageLocators.countOfFoundContacts.innerText();
        return parseInt(count);
    }

    async clickOnNextPage() {
        await this.pageLocators.nextPage.click();
    }

    async checkTheChechbox(item: string) {
        const checkbox = await this.pageLocators.getCheckboxByEmail(this.pageLocators.chechboxPlusFirstColumn, item);
        if (checkbox && (await checkbox.count()) > 0 && !(await checkbox.isChecked())) {
            await checkbox.check();
        }
    }

    async countCheckedCheckboxes() {
        let checkedBoxesCount = 0;
        const checkedBoxes = this.pageLocators.checkboxes;
        for (let i = 0; i < await checkedBoxes.count(); i++) {
            const label = await checkedBoxes.nth(i).getAttribute('aria-label');
            if (label?.includes('(checked)'))
                checkedBoxesCount++;
        }
        return checkedBoxesCount;
    }

    async saveDownloadedFile(filePath: string, buttonName: string) {
        const button = await this.pageLocators.getButton(buttonName);
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            button.click()
        ]);

        await download.saveAs(filePath);
    }

    async clickActionButton(label: string) {
        const actionButton = await this.pageLocators.getElementByLable(label);
        await expect(actionButton).toBeVisible();
        await actionButton.click();
    }

    async getColumnValues(columnName: string) {
        return await this.pageLocators.getCell(columnName);
    }

    async clearInputField(nameField: string) {
        const field = await this.pageLocators.getElementByLable(nameField);
        await field.clear();
    }

    async fillInTheInput(nameField: string, text: string) {
        const field = await this.pageLocators.getElementByLable(nameField);
        await field.fill(text, { timeout: 10000 });
        await field.click();
    }

    async clickOnTheDropdown(nameField: string) {
        const field = await this.pageLocators.getElementByLable(nameField);
    }

    async selectItemFromDropdown(nameItem: string) {
        await (await this.pageLocators.selectCorrespondingItem(nameItem)).click();
    }

    async openReferAFriend() {
        await this.pageLocators.shareWithFriendsWrapper.click();
    }

    async clickOnBackToDashboard() {
        await this.pageLocators.backToDoshboard.click();
    }
    //#endregion

    //#region 🔹 Expectations
    async selectedEmailsAreDownloaded(filePath: string, nameOfColumn: string, expectedEmails: string[]) {
        const emails = (await this.readCsv(filePath, nameOfColumn));

        console.log('🔹 Emails from file:', emails);
        console.log('🔹 Expected emails:', expectedEmails);
        expect(emails.length).toBe(expectedEmails.length);

        for (var i = 0; i < expectedEmails.length; i++) {
            expect(emails.sort()[i]).toContain(expectedEmails.sort()[i]);
        }
    }

    async expectButtonIsVisible(buttonName: string) {
        const button = await this.pageLocators.getButton(buttonName);
        await expect(button).toBeVisible({ timeout: 30000 });
    }

    async expectButtonIsNotVisible(buttonName: string) {
        const button = await this.pageLocators.getButton(buttonName);
        await expect(button).not.toBeVisible({ timeout: 60000 });
        await expect(button).toBeHidden({ timeout: 60000 });
    }

    async expectPageTitleIs(expectedTitle: string) {
        const title = await this.pageLocators.getTitle(this.pageLocators.title, expectedTitle);
        await expect(title).toBeVisible({ timeout: 10000 });
    }

    async expectFileIsUploaded(fileName: string) {
        await expect(this.pageLocators.fileInfo).toBeVisible();
        await expect(this.pageLocators.fileInfo).toContainText(fileName);
    }

    async correspondingItemsAreDownloaded(filePath: string, nameOfColumn: string, expectedText: string) {
        const emails = (await this.readCsv(filePath, nameOfColumn));

        console.log('🔹 Emails from file:', emails);
        console.log('🔹 Expected text contain:', expectedText);

        for (var i = 0; i < emails.length; i++) {
            expect(emails[i]).toContain(expectedText);
        }
    }

    async expectRecognizedEmailsIsShown(filePath: string) {
        const emailsCount = (await this.readCsv(filePath, 'Email'))
            .join('\n')
            .split(/\r?\n/)
            .map(email => email.trim())
            .filter(email => email.includes('@'))
            .length.toString();

        const resultField = this.pageLocators.recognizedEmailCount.nth(0).filter({ hasText: `${emailsCount}` });
        await expect(resultField).toBeVisible();
    }

    async validateCleaningList(filePath: string) {
        var cleaningList = await this.readCsv(filePath, 'Email');
        expect(cleaningList).not.toBeNull();
        expect(cleaningList.length).toBeGreaterThan(0);
    }

    async expectModalIsShown(expectedTitle: string) {
        const titleModalWindow = await this.pageLocators.getTitle(this.pageLocators.titleModalWindow, expectedTitle);
        await expect(titleModalWindow).toBeVisible({ timeout: 10000 });
    }

    async expectModalIsNotShown(expectedTitle: string) {
        const titleModalWindow = await this.pageLocators.getTitle(this.pageLocators.titleModalWindow, expectedTitle);
        await expect(titleModalWindow).not.toBeVisible();
    }

    async expectDrawerIsShown(expectedTitle?: string) {
        if (expectedTitle) {
            const drawer = await this.pageLocators.getTitle(this.pageLocators.drawerHeader.first(), expectedTitle);
            await expect(drawer).toBeVisible();
        }
        else {
            await expect(this.pageLocators.drawerHeader.first()).toBeVisible();
        }
    }

    async expectDrawerIsNotShown(expectedTitle?: string) {
        if (expectedTitle) {
            const drawer = await this.pageLocators.getTitle(this.pageLocators.drawerHeader.first(), expectedTitle);
            await expect(drawer).not.toBeVisible();
        }
        else {
            await expect(this.pageLocators.drawerHeader.first()).not.toBeVisible();
        }
    }

    async expectPopUpNotificationIs(expectedText: string) {
        await expect(this.pageLocators.popUpNotification).toBeVisible();
        await expect(this.pageLocators.popUpNotification).toHaveText(expectedText);
    }

    async expectCorrespondingUrl(url: string) {
        await this.page.waitForURL(`**${url}`, { timeout: 120000, waitUntil: "domcontentloaded" });
    }

    async expectValidationMessage(expectedMessage: string) {
        await expect(this.pageLocators.validationMessage.first()).toHaveText(expectedMessage);
    }

    async expectValidationMessageIsNotVisible() {
        await expect(this.pageLocators.validationMessage).not.toBeVisible();
    }

    async searchFor(searchText: string) {
        await this.pageLocators.searchInput.clear();
        await this.pageLocators.searchInput.fill(searchText, { timeout: 15000 });
        await this.pageLocators.searchInput.click();
    }

    async createNewList(listName: string) {
        await this.pageLocators.addListButton.click();
        await expect(this.pageLocators.addNewListButton).toHaveText("Create new list");
        await this.pageLocators.addNewListButton.click();
        await this.pageLocators.listNameInput.click();
        await this.pageLocators.listNameInput.fill(listName, { timeout: 10000 });
        await this.pageLocators.saveListButton.click({ timeout: 10000 });
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('load');
        await this.pageLocators.outOfLists.click({ position: { x: 50, y: 50 } });
    }

    async addList(listName: string) {
        await this.pageLocators.addListButton.click();
        const list = await this.pageLocators.selectCorrespondingItem(listName);
        await expect(list).toBeVisible({ timeout: 10000 });
        await list.click();
        await this.pageLocators.outOfLists.click({ position: { x: 50, y: 100 } });
    }

    //Get the row by email and check if expexted text is presented in the corresponding column
    async expectItemByEmail(email: string, nameColumn: string, expectedText: string) {
        await expect(await this.pageLocators.getCellByName(email, nameColumn)).toHaveText(expectedText);
    }

    async expectItemsAreInTheList(columnName: string, text: string) {
        const cells = await this.pageLocators.getCell(columnName);
        const countPerPage = await cells.count();
        const countOfFoundContacts = await this.getCountOfFoundContacts();
        const countOfPages = Math.ceil(countOfFoundContacts / countPerPage);

        for (let p = 1; p <= countOfPages; p++) {
            const remainder = countOfFoundContacts % countPerPage;
            const itemsToCheck = (p === countOfPages) && (remainder !== 0) ? remainder : countPerPage;
            console.log('ostatoc', remainder);
            console.log('itemsToCheck', itemsToCheck);

            for (let i = 0; i < itemsToCheck; i++) {
                const cell = cells.nth(i);
                await expect(cell).toContainText(text);
            }

            if (p < countOfPages) {
                await this.clickOnNextPage();
            }
        }
    }

    async expectTheButtonIsDisabled(buttonName: string) {
        const button = await this.pageLocators.getButton(buttonName);
        await expect(button).toBeDisabled();
    }

    async expectTheButtonIsEnabled(buttonName: string) {
        const button = await this.pageLocators.getButton(buttonName);
        await expect(button).toBeEnabled({ timeout: 10000 });
    }

    async expectAuthMenuItemsArePresented(menuItemName: string[]) {
        for (const item of menuItemName) {
            const menuItem = this.pageLocators.authMenuItem.filter({ hasText: item });
            await expect(menuItem).toBeVisible();
        }
    }

    async expectProfileMenuUserDataIsVisible(userName: string) {
        await expect(this.pageLocators.profileMenuUserData).toBeVisible();
        await expect(this.pageLocators.profileMenuUserData).toContainText(userName);
    }

    async expectShareWithFriendsWrapperIsVisible() {
        await expect(this.pageLocators.shareWithFriendsWrapper).toBeVisible();
    }

    async expectFollowingFieldAreShown(lables: string[]) {
        for (const lable of lables) {
            await expect(await this.pageLocators.getElementByLable(lable)).toBeVisible();
        }
    }

    async expectFieldIsUneditable(nameField: string) {
        const field = await this.pageLocators.getElementByLable(nameField);
        await expect(field).not.toBeEditable();
    }
    //#endregion       
}