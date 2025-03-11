import { Locator, Page } from '@playwright/test';

export class VerifyEmailSearchPage {
    readonly page: Page;
    readonly headerEmailVerificationReport: Locator;
    readonly headerBulkEmailVerificationResult: Locator;
    readonly verifyButton: Locator;
    readonly searchBulkEmailsInput: Locator;
    readonly switcherToBulkEmailsVerification: Locator;
    readonly switcherToSingleEmailVerification: Locator;
    readonly emailVerificationReportItems: Locator;
    readonly hiddenButtonEmailVerificationResult: Locator;
    readonly closeModalButton: Locator;
    readonly statusIcon: Locator;
    readonly searchEmailInput: Locator

    constructor(page: Page) {
        this.page = page;
        this.headerEmailVerificationReport = page.locator('div[class="email-header"] p');
        this.headerBulkEmailVerificationResult = page.locator('p[class="email"]');
        this.searchBulkEmailsInput = page.getByPlaceholder('john.doe@example.com\njohn.doe@example.com');
        this.searchEmailInput = page.getByPlaceholder('john.doe@example.com');
        this.verifyButton = page.locator('button', { hasText: 'Verify' });
        this.switcherToSingleEmailVerification = page.locator('div.tab-item', { hasText: 'Single Email Verification' });
        this.switcherToBulkEmailsVerification = page.locator('div.tab-item', { hasText: 'Bulk Email Verification' });
        this.emailVerificationReportItems = page.locator('div[class="email-item"] p');
        this.hiddenButtonEmailVerificationResult = page.getByRole('img', { name: 'Show email verification result' });
        this.closeModalButton = page.locator('//*[@class="cross-icon"]/..');
        this.statusIcon = page.locator('.email-status-description > .svg-inline--fa');
    }

    async getVerifyButton(buttonName: string) {
        return this.page.getByRole('button', { name: buttonName });
    }
}