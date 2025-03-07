import { Page, expect } from '@playwright/test';
import { SingleEmailFinderPage } from '../pages/singleEmailFinderPage';

export class SingleEmailFinderStep {
    readonly page: Page;
    readonly pageLocators: SingleEmailFinderPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new SingleEmailFinderPage(page);
    }

    async fillInFirstName(firstName: string) {
        await this.pageLocators.firstNameInput.fill(firstName);
    }

    async fillInLastName(lastName: string) {
        await this.pageLocators.lastNameInput.fill(lastName);
    }

    async fillInDomain(domain: string) {
        await this.pageLocators.domainInput.fill(domain);
    }

    async clickOnFindEmailButton() {
        await this.pageLocators.findEmailButton.click();
    }

    async clickOnAddToListButton() {
        await this.pageLocators.addToListButton.click();
    }

    async clickOnFindAnotherPersonButton() {
        await this.pageLocators.findAnotherPersonButton.click();
    }

    async saveEmail() {
        await this.pageLocators.saveEmailButton.click();
    }

    async expectContactCardFullName(firstName: string, lastName: string, domain: string) {
        await this.page.waitForLoadState('load');
        const contant = await this.pageLocators.contactCardFullName.innerText();
        await expect(contant).toContain(firstName || lastName || domain);
    }

    async expectContentTitle(text: string) {
        await expect(this.pageLocators.contentTitle).toHaveText(text);
    }
}