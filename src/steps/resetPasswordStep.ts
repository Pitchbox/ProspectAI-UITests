import { Page, expect } from '@playwright/test';
import { ResetPasswordPage } from '../pages/resetPasswordPage';

export class ResetPasswordStep {
    readonly page: Page;
    readonly pageLocators: ResetPasswordPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new ResetPasswordPage(page);
    }

    async expectToBeOpenedResetPasswordPage() {
        await expect(this.pageLocators.headerResetPasswordPage).toBeVisible();
        await expect(this.pageLocators.headerResetPasswordPage).toHaveText("Reset Password");
    }
}