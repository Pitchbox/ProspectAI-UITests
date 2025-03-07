import { test, expect, Page, Locator } from '@playwright/test';

export class SignUpPage {
    page: Page;
    readonly emailInput: Locator;
    readonly signUpButton: Locator;
    readonly verificationCodeInput: Locator;
    readonly verifyButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input.MuiFilledInput-input');
        this.signUpButton = this.page.getByRole('button', { name: "Sign up", exact: true });
        this.verificationCodeInput = this.page.getByPlaceholder('Verification code');
        this.verifyButton = this.page.locator('button.submit-button');
    }
}