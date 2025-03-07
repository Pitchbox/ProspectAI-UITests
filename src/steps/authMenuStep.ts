import { Page, expect } from '@playwright/test';
import { GeneralPage } from '../pages/generalPage';
import { AuthMenuPage } from '../pages/authMenuPage';

export class AuthMenuStep {
    readonly page: Page;
    readonly pageLocators: AuthMenuPage;
    readonly generalPage: GeneralPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new AuthMenuPage(page);
        this.generalPage = new GeneralPage(page);
    }

    //#region 🔹 Actions
    async openDropdown(fieldName: string) {
        const button = await this.pageLocators.getDropdownButton(fieldName);
        await button.click();
    }

    async getInputFieldValue(nameField: string) {
        return await (await this.pageLocators.getInputField(nameField, this.pageLocators.inputFields)).getAttribute('value');
    }

    async getInputDropdownValue(nameField: string) {
        return await (await this.pageLocators.getInputField(nameField, this.pageLocators.inputDropdown)).getAttribute('value');
    }

    async clickOnConnectIntegrationButton(company: string) {
        const button = await this.pageLocators.getConnectIntegtationButtonByCompany(company);
        await this.expectCompaniesAreDisconnected([company]);
        await button.click({ timeout: 10000 });
    }

    async clickOnDisconnectIntegrationButton(company: string) {
        const button = await this.pageLocators.getDisconnectIntegtationButtonByCompany(company);
        await this.expectCompaniesAreConnected([company]);
        await button.click();
    }

    async fillInInviteByEmailInput(email: string) {
        await this.pageLocators.inviteByEmailInput.fill(email);
    }

    async focusOnInviteByEmailInput() {
        await this.pageLocators.inviteByEmailInput.clear();
        await this.pageLocators.inviteByEmailInput.click();
    }

    async checkValueFromInviteByEmailInputIs(url: string) {
        await expect(this.pageLocators.inviteByEmailInput).toHaveValue(url);
    }

    async clickOnShareOnSocialButton(social: string) {
        const button = await this.pageLocators.getShareOnSocialButton(social.toLowerCase());
        await button.click({ timeout: 10000 });
    }

    async clickOnOnSocialButtonAndCheckUrl(page: Page, expectedUrl: string, social: string): Promise<void> {
        const [newPage] = await Promise.all([
            page.waitForEvent('popup'),
            await this.clickOnShareOnSocialButton(social)
        ]);

        await newPage.waitForLoadState('load');

        const newPageUrl = newPage.url();
        expect(newPageUrl).toContain(expectedUrl);
    }
    //#endregion  

    //#region 🔹 Expectations
    async expectFieldsAreFilled(labels: string[], expectStrings: string[]) {
        for (var i = 0; i < labels.length; i++) {
            const field = await this.getInputFieldValue(labels[i]);
            expect(field).toEqual(expectStrings[i]);
        }
    }

    async expectDropdownsInputAreFilled(labels: string[], expectStrings: string[]) {
        for (var i = 0; i < labels.length; i++) {
            const field = await this.getInputDropdownValue(labels[i]);
            expect(field).toEqual(expectStrings[i]);
        }
    }

    async expectCompaniesArePresented(companies: string[]) {
        for (var i = 0; i < companies.length; i++) {
            await expect(this.pageLocators.integrationItems.filter({ hasText: companies[i] })).toBeVisible();
        }
    }

    async expectCompaniesAreDisconnected(companies: string[]) {
        for (var i = 0; i < companies.length; i++) {
            await expect(await this.pageLocators.getConnectIntegtationButtonByCompany(companies[i])).toBeVisible();
        }
    }

    async expectCompaniesAreConnected(companies: string[]) {
        for (var i = 0; i < companies.length; i++) {
            await expect(await this.pageLocators.getDisconnectIntegtationButtonByCompany(companies[i])).toBeVisible();
        }
    }

    async expectReferralLinkIsVisible(expectValue: string) {
        const value = await this.pageLocators.inputreadOnly.getAttribute('value');
        expect(value).toEqual(expectValue);
    }

    async expectInviteByEmailInputIsVisible() {
        await expect(this.pageLocators.inviteByEmailInput).toBeVisible();
    }
    //#endregion
}
