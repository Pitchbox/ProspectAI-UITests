import { Page, expect } from '@playwright/test';
import { ContactsPage } from '../pages/contactsPage';

export class ContactsStep {
    readonly page: Page;
    private pageLocators: ContactsPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new ContactsPage(page);
    }

    //#region 🔹 Actions
    async clickOnTheCorrespondingRowTable(columnName: string, item: string) {
        const column = columnName.toLowerCase();
        await (await this.pageLocators.getCells(column)).filter({ hasText: item }).first().click();
    }

    //Get number of items from pagination panel
    async getCountOfFoundContacts() {
        const count = await this.pageLocators.countOfFoundContacts.innerText();
        return parseInt(count);
    }

    async clickOnNextPage() {
        await this.pageLocators.nextPage.click();
    }

    async getAllItemsFromTable(columnName: string) {
        return (await (await this.pageLocators.getCells(columnName)).allInnerTexts()).map(item => item.trim());
    }

    async delateSelectedContactsFromAddressBook() {
        await this.pageLocators.deleteFromAddresBookButton.isVisible();
        await this.pageLocators.deleteFromAddresBookButton.click();
    }

    async confirmDeleteContacts() {
        await this.pageLocators.confirmDeleteButton.click();
    }

    async clickOnToggleAllCheckbox() {
        await this.pageLocators.toggleAll.click();
    }

    async clickOnAddContactButton() {
        await this.pageLocators.addContactButton.click();
    };

    async clickOnCreateContactButton() {
        await this.pageLocators.createContactButton.click();
    };

    async clickOnUploadContactsButton() {
        await this.pageLocators.uploadContactsButton.click();
    }

    async clickOnMenuItemImportContacts() {
        await this.pageLocators.itemOfUploadContactMenu.click();
    }

    async fillInTheInputField(fieldName: string, text: string) {
        await (await this.pageLocators.getInputFieldByLabel(fieldName)).fill(text);
    }

    async clearInputField(fieldName: string) {
        await (await this.pageLocators.getInputFieldByLabel(fieldName)).clear();
    }

    async fillInMenuSearchInput(text: string) {
        await this.pageLocators.menuSearchInput.fill(text, { timeout: 10000 });
    }

    async expectItemsAreInDropdown(searchText: string) {
        const items = this.pageLocators.itemsOfContactsDropdown;

        for (var i = 0; i < await items.count(); i++) {
            await expect(items.nth(i)).toContainText(searchText, { timeout: 10000 });
        }
    }

    async expectItemIsNotInDropdown(item: string) {
        const items = await this.pageLocators.itemsOfContactsDropdown.allInnerTexts();
        expect(items).not.toContain(item);
    }

    // Contacts/companies dropdown select by email/domain
    async selectItemFromContactsDropdown(item: string) {
        await expect(this.pageLocators.itemsOfContactsDropdown).not.toHaveCount(0);
        await this.pageLocators.itemsOfContactsDropdown.filter({ hasText: item }).first().click();
    }

    async openCompaniesDropdownAddContactDrawer() {
        await this.pageLocators.companiesDropdownAddContactDrawer.click();
    }

    async selectNewContactDropdownItem() {
        await this.pageLocators.newContactDropdownItem.click();
    }

    async expectLoaderHidden() {
        await expect(this.pageLocators.rowLoader).toBeHidden({ timeout: 10000 });
    }

    async expectNoRowsToCenterIsVisible() {
        await expect(this.pageLocators.noRowCenter).toBeVisible({ timeout: 10000 });
    }

    async theTableIsLoaded() {
        let areItemsShown: boolean;
        await expect(this.pageLocators.rowLoader).toBeVisible({ timeout: 5000 }).catch(() => { () => console.log('Loader did not appear, skipping waiting') });
        await expect(this.pageLocators.rowLoader).toBeHidden({ timeout: 15000 });
        const hasContacts = await this.getCoutnOfRows() > 1;
        const noRowsVisible = await this.pageLocators.noRowCenter.isVisible();

        if (hasContacts) {
            return areItemsShown = true;
        } else if (noRowsVisible) {
            expect(this.pageLocators.noRowCenter).toHaveText('No Rows To Show');
            return areItemsShown = false;
        }
    }

    async getCoutnOfRows() {
        await expect(this.pageLocators.rowLoader).toBeHidden({ timeout: 15000 });
        return await this.pageLocators.row.count();
    }
    //#endregion

    //#region 🔹 Expect
    async expectCountOfItemIsPresented(columnName: string, items: string[]) {
        await expect(await this.pageLocators.getCells(columnName)).toHaveCount(items.length);
    }

    async expectItemsAreInList(columnName: string, items: string[]) {
        for (const item of items) {
            await expect((await this.pageLocators.getCells(columnName)).filter({ hasText: item })).toBeVisible({ timeout: 10000 });
        }
    }

    async expectItemAreNotInList(columnName: string, items: string[]) {
        const allItems = await (await this.pageLocators.getCells(columnName)).allInnerTexts();
        if (allItems.length !== 0) {
            for (const item of items) {
                expect(allItems).not.toContain(item);
            }
        }
        else {
            expect(allItems).toEqual([]);
        }
    }

    async expectItemsAreInTheList(columnName: string, text: string) {
        const countOfFoundContacts = await this.getCountOfFoundContacts();
        const cells = await this.pageLocators.getCells(columnName);
        const countPerPage = await cells.count();
        const countOfPages = Math.ceil(countOfFoundContacts / countPerPage);

        for (let p = 1; p <= countOfPages; p++) {
            const remainder = countOfFoundContacts % countPerPage;
            const itemsToCheck = (p === countOfPages) && (remainder !== 0) ? remainder : countPerPage;

            for (let i = 0; i < itemsToCheck; i++) {
                const cell = cells.nth(i);
                await expect(cell).toContainText(text);
            }

            if (p < countOfPages) {
                await this.clickOnNextPage();
            }
        }
    }

    async expectContactsIsInTheListOnDrawer(item: string) {
        await expect(this.pageLocators.contactsWrapperOnDrawer.filter({ hasText: item })).toBeVisible({ timeout: 10000 });
    }

    async expectErrorIsPresented(fieldName: string, text?: string) {
        if (text) {
            await expect(await this.pageLocators.getErrorByField(fieldName)).toHaveText(text, { timeout: 10000 });
        }
        else {
            await expect(await this.pageLocators.getErrorByField(fieldName)).toBeVisible({ timeout: 10000 });
        }
    }
    //#endregion
}