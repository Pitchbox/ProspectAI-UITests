import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';

export class LoginStep {
    readonly page: Page;
    readonly pageLocators: LoginPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new LoginPage(page);
    }

    async fillUsername(username: string) {
        await this.pageLocators.usernameField.fill(username);
    }

    async fillPassword(password: string) {
        await this.pageLocators.passwordField.fill(password);
    }

    async clickLoginButton() {
        await this.pageLocators.loginButton.click();
    }

    async login(username: string, password: string) {
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.clickLoginButton();
    }

    async logInWith(company: string) {
        const button = await this.pageLocators.getSignInWithButtons(company);
        await expect(this.pageLocators.headerButtonGroupSignInWith).toHaveText("or sign in with:");
        await expect(button).toBeVisible();
        await button.click();
    }

    async expectToBeOpenedLogInWithGooglePage() {
        expect(this.pageLocators.headerSignInWithGooglePage).toHaveText("Sign in with Google");
    }

    async expectToBeOpenedLogInWithLinkedInPage() {
        expect(this.pageLocators.logoLinkedin).toBeVisible();
    }

    async expectToBeOpenedLogInWithPitchboxPage() {
        expect(this.pageLocators.headerSignInWithPitchbox).toBeVisible();
    }

    async clickVisibilityIcon() {
        await this.pageLocators.visibilityIcon.first().isVisible();
        await this.pageLocators.visibilityIcon.first().click();
    }

    //The first argument is for readability
    async expectPasswordIs(isVisible: string, value: string) {
        const typeAttribute = await this.pageLocators.passwordField.getAttribute('type');
        expect(typeAttribute).toBe(value);
    }
}