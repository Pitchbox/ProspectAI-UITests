import { Page, Locator } from '@playwright/test';

export class SettingsPage {
    readonly page: Page;
    readonly teamMemberItems: Locator;
    readonly contentWrapper: Locator;
    readonly termsThanksForJoiningPage: Locator;
    readonly privacyPolicy: Locator;
    readonly checkbox: Locator;
    readonly inputRoleDropdown: Locator;
    readonly creditsWrapper: Locator;
    readonly usageSearchItemInfo: Locator;
    readonly planLink: Locator;
    readonly billingContent: Locator;
    readonly billingDetails: Locator;
    readonly paymentMethod: Locator;
    readonly gridPaymentHistory: Locator;
    readonly rowPaymentHistory: Locator;
    readonly switcherPayMonthlyBuyCredits: Locator;
    readonly subscriptionItems: Locator;
    readonly activeSubscription: Locator;
    readonly creditsAvailable: Locator;
    readonly deleteAccountItem: Locator;
    readonly apiKeyContant: Locator;
    readonly apiKeyTitles: Locator;

    constructor(page: Page) {
        this.page = page;
        this.teamMemberItems = page.locator('div.team-member-item');
        this.contentWrapper = page.locator('div.content-wrapper');
        this.termsThanksForJoiningPage = page.locator('div.terms-wrapper');
        this.privacyPolicy = page.locator('[href="https://prospectai.com/privacy-policy"]');
        this.checkbox = page.getByRole('checkbox');
        this.inputRoleDropdown = page.getByRole('combobox', { name: 'Role' });
        this.creditsWrapper = page.locator('div.used-credits-wrapper');
        this.usageSearchItemInfo = page.locator('div.search-item-info');
        this.planLink = page.locator('.plan-link a');
        this.billingContent = page.locator('div.billing-content');
        this.billingDetails = page.locator('div.billing-details');
        this.paymentMethod = page.locator('div.payment-method');
        this.gridPaymentHistory = page.locator('div.MuiDataGrid-main');
        this.rowPaymentHistory = page.getByRole('row');
        this.switcherPayMonthlyBuyCredits = page.locator('div.tab-item');
        this.subscriptionItems = page.locator('div.subscription-item');
        this.activeSubscription = page.locator('div.active-subscription');
        this.creditsAvailable = page.locator('div.credits-available');
        this.deleteAccountItem = page.locator('div.delete-account-item');
        this.apiKeyContant = page.locator('div.api-key-wrapper');
        this.apiKeyTitles = page.locator('p.name-title');
    }

    getTextboxByRole = async (item: string) => { return this.page.getByRole('textbox', { name: item }); }

    getUserRole = async (email: string) => { return this.teamMemberItems.filter({ hasText: email }).locator('p.role'); }

    getColumn = async (column: string) => { return this.rowPaymentHistory.getByLabel(column); };
    //data-field = created/amount/status/actions

    getCellsPaymentHistoryByColumn = async (column: string, rowIndex: number) => { return this.rowPaymentHistory.nth(rowIndex).locator(`[data-field='${column}']`); }

    getReceipt = async (rowIndex: number) => { return this.rowPaymentHistory.nth(rowIndex).getByRole('button'); }

    getApiKeyInfoExpire = async (apiKey: string) => {
        return this.apiKeyContant.filter({ hasText: apiKey }).locator('div.api-key-info').filter({ hasText: 'Expire:' }).locator('span');
    }

    getApiKeyInfoCreated = async (apiKey: string, nameButton: string) => {
        return this.apiKeyContant.filter({ hasText: apiKey })
            .locator(`//*[@aria-label="${nameButton}"]/../button`);
    }
}