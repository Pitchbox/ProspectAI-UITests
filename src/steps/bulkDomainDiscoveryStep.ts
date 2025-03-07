import { Page, expect } from '@playwright/test';
import { FindEmailAddressesPage } from '../pages/findEmailAddressesPage';
import { BulkSearchDomainPage } from '../pages/bulkSearchDomainPage';

export class BulkDomainDiscoveryStep {
    readonly page: Page;
    readonly findEmailAddressesPage: FindEmailAddressesPage;
    readonly bulkSearchDomainPage: BulkSearchDomainPage;

    constructor(page: Page) {
        this.page = page;
        this.findEmailAddressesPage = new FindEmailAddressesPage(page);
        this.bulkSearchDomainPage = new BulkSearchDomainPage(page);
    }

    //#region 🔹 Actions
    async fillInBulkDomains(domains: string) {
        await this.findEmailAddressesPage.searchBulkDomainsInput.fill(domains);
    }

    async clickOnSearchButton() {
        await this.findEmailAddressesPage.searchButton.click();
    }

    async getCurrentPageNumber() {
        const currentPageNumber = await this.bulkSearchDomainPage.currentPageNumber.innerText();
        return parseInt(currentPageNumber);
    }

    async clickOnPreviousPage() {
        await this.bulkSearchDomainPage.previousPage.click();
    }

    async clickOnLastPage() {
        await this.bulkSearchDomainPage.lastPage.click();
    }

    async clickOnFirstPage() {
        await this.bulkSearchDomainPage.firstPage.click();
    }

    async saveCorrespondingContacts() {
        await this.bulkSearchDomainPage.saveContactsButton.click();
    }

    async saveItems() {
        await this.bulkSearchDomainPage.saveItemsModalButton.click();
    }

    async cancelSavingItem() {
        await this.bulkSearchDomainPage.cancelSavingItemsModelButton.click();
    }
    //#endregion
}