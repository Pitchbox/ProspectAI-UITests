import { Page, expect } from '@playwright/test';
import { VerifyEmailSearchPage } from '../pages/verifyEmailsSearchPage';

export class VerifyEmailSearchStep {
    readonly page: Page;
    readonly pageLocators: VerifyEmailSearchPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new VerifyEmailSearchPage(page);
    }

    async clickOnVerifyButton(text: string) {
        const button = this.pageLocators.verifyButton;
        await button.click();
    }

    async clickOnSwitcherToBulkEmailsVerification() {
        await this.pageLocators.switcherToBulkEmailsVerification.click();
    }

    async clickOnSwitcherToSingleEmailVerification() {
        await this.pageLocators.switcherToSingleEmailVerification.click();
    }

    async clickOnHiddenButtonEmailVerificationResult() {
        this.pageLocators.emailVerificationReportItems.nth(0).hover();
        await this.pageLocators.hiddenButtonEmailVerificationResult.nth(0).click();
    };

    async clickOnCloseModalButton() {
        await this.pageLocators.closeModalButton.click();
    };

    async fillInEmails(emails: string) {
        await this.pageLocators.searchBulkEmailsInput.fill(emails);
    }

    async fillInEmail(email: string) {
        await this.pageLocators.searchEmailInput.fill(email);
    }

    async expectEmailVerificationResultModalIsOpen(expectedItems: string) {
        var email = expectedItems.split('\n')[0];
        await expect(this.pageLocators.headerBulkEmailVerificationResult).toHaveText(email);
    };

    async expectEmailVerificationReportItems(expectedItems: string) {
        await this.page.waitForTimeout(600);
        const emailsCount = await this.pageLocators.emailVerificationReportItems.count();
        const formattedEmails = expectedItems.split('\n');

        for (let i = 0; i < emailsCount; i++) {
            await expect(this.pageLocators.emailVerificationReportItems.nth(i)).toHaveText(formattedEmails[i]);
        }
    };

    async expectHeaderEmailDiscoveryReport(email: string) {
        await expect(this.pageLocators.headerEmailVerificationReport.filter({ hasText: email })).toBeVisible();
    };

    async expectStatusIconIsVisible() {
        await expect(this.pageLocators.statusIcon).toBeVisible();
    };
}