import { Page, Locator } from "@playwright/test";

export class BulkSearchDomainPage {
    readonly page: Page;
    readonly searchButton: Locator;
    readonly currentPageNumber: Locator;
    readonly previousPage: Locator;
    readonly lastPage: Locator;
    readonly firstPage: Locator;
    readonly selectAllContacts: Locator;
    readonly selectContactCheckbox: Locator;
    readonly saveContactsButton: Locator;
    readonly saveItemsModalButton: Locator;
    readonly cancelSavingItemsModelButton: Locator;


    constructor(page: Page) {
        this.page = page;
        this.searchButton = this.page.locator('.MuiInputBase-root');
        this.currentPageNumber = this.page.locator('span[ref="lbCurrent"]');
        this.previousPage = page.getByLabel('Previous Page');
        this.lastPage = page.getByLabel('Last Page');
        this.firstPage = page.getByLabel('First Page');
        this.saveContactsButton = page.locator('div.title-action-button');
        this.selectContactCheckbox = page.locator('.ag-selection-checkbox > .ag-labeled > .ag-wrapper');
        this.saveItemsModalButton = page.getByRole('button', { name: 'Save' });
        this.cancelSavingItemsModelButton = page.getByRole('button', { name: 'Cancel' });
    }
}