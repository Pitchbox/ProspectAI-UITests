import { Page, Locator } from "@playwright/test";
export class OutreachePage {
    readonly page: Page;
    readonly addEmailItems: Locator;
    readonly tableHead: Locator;
    readonly title: Locator;
    readonly row: Locator;
    readonly itemsThreeDodsMenu: Locator;
    readonly inputFields: Locator;
    readonly items_SSL_TLSDropdown: Locator;
    readonly circularProgress: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addEmailItems = page.locator('div.add-email-item');
        this.tableHead = page.locator('div.table-head');
        this.title = page.locator('div [class*="title"]');
        this.row = page.locator('div.item-row');
        this.itemsThreeDodsMenu = page.getByRole('menuitem');
        this.inputFields = page.locator('div.input-filled');
        this.items_SSL_TLSDropdown = page.getByRole('option', { name: 'None' });
        this.circularProgress = page.locator('div.circular-progress');
    }

    getCells = async (columnName: string) => { return this.page.locator(`div.${columnName}`); }

    getMenuActions = async (email: string) => { return this.row.filter({ hasText: email }).locator(`div.menu-wrapper`); }

    getStatusByEmail = async (email: string) => { return this.row.filter({ hasText: email }).locator('div.MuiChip-root span'); }

    getItemByEmailAccount = async (email: string, columnName: string) => { return this.row.filter({ hasText: email }).locator(`[class="${columnName}"]`); }

    getInputFieldByLabel = async (nameField: string) => { return this.page.getByLabel(nameField); }

    getInputField = async (nameField: string, index: number) => { return this.inputFields.filter({ hasText: nameField }).nth(index).locator(`input`); }

    get_SSL_TLS_DropdownItems = async (item: string) => { return this.page.getByRole('option', { name: item }); }

    getTitleWithWait = async (title: string) => {
        await this.page.waitForSelector(`'div [class*="title"] p:has-text("Email Accounts")'`, { state: 'visible', timeout: 150000 });
        return this.page.locator(`div [class*="title"]`, { hasText: title }).first();
    }
}