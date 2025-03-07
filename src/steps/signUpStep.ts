import { Page, expect } from '@playwright/test';
import { SignUpPage } from '../pages/signUpPage';

export class SignUpStep {
    page: Page;
    readonly pageLocators: SignUpPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new SignUpPage(page);
    }

    async fillEmail(email: string) {
        await this.pageLocators.emailInput.fill(email);
    }

    async clickOnSignUpButton() {
        await this.pageLocators.signUpButton.click();
        await this.page.waitForLoadState();
    }

    async fillVerificationCode(code: string) {
        await this.pageLocators.verificationCodeInput.fill(code);
    }

    async clickOnVerifyButton() {
        await this.pageLocators.verifyButton.click();
        await this.page.waitForLoadState();
    }
}