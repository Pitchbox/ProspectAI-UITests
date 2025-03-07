import { Page, expect } from '@playwright/test';
import { EmailDiscoveryReportPage } from '../pages/emailDiscoveryReportPage';

export class EmailDiscoveryReportStep {
    readonly page: Page;
    readonly pageLocators: EmailDiscoveryReportPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new EmailDiscoveryReportPage(page);
    }

    async clickOnAddToListButton() {
        await this.pageLocators.addToListButton.click();
    }

    async clickOnSaveButton() {
        await this.pageLocators.saveCompanyButton.click();
    }

    async deleteList(listName: string) {
        await this.pageLocators.deleteList.filter({ hasText: listName }).click();
    }

    async expectListToBeAbsent(listName: string) {
        expect(this.pageLocators.dropDownContent.filter({ hasText: listName }).count()).toBe(0);
    }

    async expectListToBePresent(listName: string) {
        expect(this.pageLocators.dropDownContent.filter({ hasText: listName }).isVisible()).toBeTruthy();
    }
}