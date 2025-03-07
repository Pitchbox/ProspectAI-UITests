import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly loginButton: Locator;
    readonly usernameField: Locator;
    readonly passwordField: Locator;
    readonly headerButtonGroupSignInWith: Locator;
    readonly headerSignInWithGooglePage: Locator;
    readonly headerSignInWithPitchbox: Locator;
    readonly submitButton: Locator;
    readonly logoLinkedin: Locator;
    readonly visibilityIcon: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.usernameField = page.locator('input.css-13k7vc9');
        this.passwordField = page.locator('input.css-136wj35');
        this.headerButtonGroupSignInWith = page.locator('div.services>p');
        this.headerSignInWithGooglePage = page.locator('div.WHUyzc');
        this.headerSignInWithPitchbox = page.locator('h1[class="oauth-title"]', { hasText: 'Authorize Integration' });
        this.submitButton = page.locator('[type="submit"]', { hasText: 'Sign In' });
        this.logoLinkedin = page.locator('div>li-icon[alt="LinkedIn"]');
        this.visibilityIcon = page.locator('button.MuiIconButton-edgeEnd');
    }

    // Sign In with Google or Linkedin or Pitchbox
    async getSignInWithButtons(company: string) {
        return this.page.locator(`button.MuiButtonBase-root.${company}-button`);
    }

    async getEmailInput(text: string) {
        return this.page.getByLabel(text);
    }

    async getPasswordInput(text: string) {
        return this.page.getByLabel(text);
    }
}