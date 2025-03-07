import { Locator, Page } from '@playwright/test';

export class FindEmailAddressesPage {
    readonly page: Page;
    readonly searchDomainInput: Locator;
    readonly searchButton: Locator;
    readonly searchBulkDomainsInput: Locator;
    readonly switcherToBulkSearchDomains: Locator;
    readonly switcherToQuickSearchDomains: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchDomainInput = page.getByPlaceholder('domain.com');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.searchBulkDomainsInput = page.getByPlaceholder('domain.com\ndomain.com');
        this.switcherToQuickSearchDomains = page.locator('div.tab-item', { hasText: 'Quick Email Discovery' });
        this.switcherToBulkSearchDomains = page.locator('div.tab-item', { hasText: 'Bulk Email Discovery' });
    }
}