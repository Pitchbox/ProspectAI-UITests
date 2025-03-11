import { Page, Locator } from '@playwright/test';

export class ResetPasswordPage {
    page: Page;
    readonly headerResetPasswordPage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.headerResetPasswordPage = page.locator('p').filter({ hasText: /^Reset Password$/ })
    }
}