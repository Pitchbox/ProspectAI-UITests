import { Locator, Page } from "@playwright/test";

export class ContactsPage {
    readonly page: Page;
    readonly countOfFoundContacts: Locator;
    readonly nextPage: Locator;
    readonly headers: Locator;
    readonly deleteFromAddresBookButton: Locator;
    readonly confirmDeleteButton: Locator;
    readonly confirmCanceleButton: Locator;
    readonly toggleAll: Locator;
    readonly addContactButton: Locator;
    readonly exportContactsButton: Locator;
    readonly createContactButton: Locator;
    readonly uploadContactsButton: Locator;
    readonly addCompanyButton: Locator;
    readonly errorThisFieldIsRequired: Locator;
    readonly itemOfUploadContactMenu: Locator;
    readonly selectListDropdown: Locator;
    readonly menuSearchInput: Locator;
    readonly contactsWrapperOnDrawer: Locator;
    readonly itemsOfContactsDropdown: Locator;
    readonly companiesDropdownAddContactDrawer: Locator;
    readonly newContactDropdownItem: Locator;
    readonly deleteButtonDrawer: Locator;
    readonly closeDrawerButton: Locator;
    readonly rowLoader: Locator;
    readonly noRowCenter: Locator;
    readonly row: Locator;

    constructor(page: Page) {
        this.page = page;
        this.countOfFoundContacts = page.locator('div span[ref="lbRecordCount"]');
        this.nextPage = page.getByLabel('Next Page');
        this.headers = page.locator('.ag-cell-label-container');
        this.deleteFromAddresBookButton = page.locator('button.delete-selected-button');//might be delete and use getbyRole
        this.confirmDeleteButton = page.locator('div.confirm-buttons >button.MuiButton-containedError'); //might be delete and use getbyRole
        this.confirmCanceleButton = page.locator('div.confirm-buttons >button.MuiButton-containedSecondaryButton'); //might be delete and use getbyRole
        this.toggleAll = page.getByLabel('Press Space to toggle all');
        this.addContactButton = page.locator('button.MuiButton-root', { hasText: 'Add Contact' }); //might be delete and use getbyRole
        this.exportContactsButton = page.locator('button.MuiButton-root', { hasText: 'Export' });//might be delete and use getbyRole
        this.createContactButton = page.locator('button.MuiButton-root', { hasText: 'Create Contact' });//might be delete and use getbyRole
        this.addCompanyButton = page.locator('button.MuiButton-root', { hasText: 'Add Company' }); //might be delete and use getbyRole
        this.uploadContactsButton = page.locator('button.split-button');
        this.errorThisFieldIsRequired = page.locator('p.Mui-error');
        this.itemOfUploadContactMenu = page.getByRole('menuitem', { name: 'Import Contacts' });
        this.selectListDropdown = page.locator('button.MuiAutocomplete-popupIndicator');
        this.menuSearchInput = page.locator('div.menu-search input');
        this.contactsWrapperOnDrawer = page.locator('div.contact-item-wrapper');
        this.itemsOfContactsDropdown = page.getByRole('menuitem');
        this.companiesDropdownAddContactDrawer = page.getByLabel('Open');
        this.newContactDropdownItem = page.locator('div.menu-new-contact');
        this.deleteButtonDrawer = page.getByLabel('Delete').locator('path');
        this.closeDrawerButton = page.getByRole('img').nth(1);
        this.rowLoader = page.locator('div.ag-row-loading');
        this.noRowCenter = page.locator('span.ag-overlay-no-rows-center');
        this.row = page.getByRole('row');
    }

    async waitforCell(column: string) {
        await this.page.waitForSelector(`[id*="cell-${column}"] > div > p`, { timeout: 10000 });
    }

    async getCells(column: string) {
        return this.page.locator(`[id*="cell-${column}"] > div > p`);
    }

    async getCheckboxByEmail(selector: Locator, email: string) {
        const emailRow = selector.filter({ hasText: email });
        return emailRow.locator('input[type="checkbox"]');
    }

    // get'Domain'/ 'Company Name' input field by label
    async getInputFieldByLabel(label: string) {
        return this.page.getByLabel(label, { exact: true })
    }

    // get error message by field name 
    async getErrorByField(inputName: string) {
        return this.page.locator(`//label[text()='${inputName}']/..//p`);
    }

    async getItemFromDropdown(itemName: string) {
        return this.page.getByRole('option', { name: itemName });
    }
}