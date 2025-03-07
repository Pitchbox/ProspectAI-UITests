import { Page, Locator } from "@playwright/test";

export class AuthMenuPage {
    readonly page: Page;
    readonly inputDropdown: Locator;
    readonly inputFields: Locator;
    readonly integrationItems: Locator;
    readonly inputreadOnly: Locator;
    readonly inviteByEmailInput: Locator;
    readonly validationErrorUnderInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inputDropdown = page.locator('div.MuiAutocomplete-root');
        this.inputFields = page.locator('div.input-flex-wrapper');
        this.integrationItems = page.locator('div.integration-item');
        this.inputreadOnly = page.locator('input.MuiFilledInput-input.Mui-readOnly');
        this.inviteByEmailInput = page.getByPlaceholder('name@example.com');
        this.validationErrorUnderInput = page.locator('div p.Mui-error');
    }

    getDropdownButton = async (fieldName: string) => { return this.inputDropdown.filter({ hasText: fieldName }).getByRole('button', { name: 'Open' }); }

    getInputField = async (label: string, selector: Locator) => { return selector.filter({ hasText: label }).locator('input'); }

    getConnectIntegtationButtonByCompany = async (company: string) => { return this.integrationItems.filter({ hasText: company }).getByRole('button', { name: 'Connect' }); }

    getDisconnectIntegtationButtonByCompany = async (company: string) => { return this.integrationItems.filter({ hasText: company }).getByLabel('Disconnect'); }

    //social: 'facebook' | 'twitter' | 'linkedin' |
    getShareOnSocialButton = async (social: string) => { return this.page.locator(`div[class*="social-wrapper ${social}"]`); }
}