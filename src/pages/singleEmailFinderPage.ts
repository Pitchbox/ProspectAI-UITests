import { Locator, Page } from '@playwright/test';

export class SingleEmailFinderPage {
    readonly page: Page;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly domainInput: Locator;
    readonly findEmailButton: Locator;
    readonly contactCardFullName: Locator;
    readonly contactEmailFullName: Locator;
    readonly addToListButton: Locator;
    readonly findAnotherPersonButton: Locator;
    readonly saveEmailButton: Locator;
    readonly cancelSavingEmailButton: Locator;
    readonly contentTitle: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameInput = page.getByPlaceholder("First name*");
        this.lastNameInput = page.getByPlaceholder("Last name*");
        this.domainInput = page.getByPlaceholder("Domain*");
        this.findEmailButton = page.locator('button.single-email-finder-search-button');
        this.contactCardFullName = page.locator('div.contact-card-email-wrapper p');
        this.contactEmailFullName = page.locator("div.contact-email-wrapper");
        this.addToListButton = page.locator('button.contact-card-add-to-list-button');
        this.findAnotherPersonButton = page.locator("button.find-another-person-button");
        this.saveEmailButton = page.getByRole('button', { name: 'Save' });
        this.cancelSavingEmailButton = page.getByRole('button', { name: 'Cancel' });
        this.contentTitle = page.locator('p.content-title');
    }
}