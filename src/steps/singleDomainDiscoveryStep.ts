import { FindEmailAddressesPage } from '../pages/findEmailAddressesPage';
import { Page } from '@playwright/test';

export class SingleDomainDiscoveryStep {
    readonly pageLocators: FindEmailAddressesPage;

    constructor(page: Page) {
        this.pageLocators = new FindEmailAddressesPage(page);
    }

    async searchDomain(domain: string) {
        await this.pageLocators.searchDomainInput.fill(domain);
        await this.pageLocators.searchButton.click();
    }
}