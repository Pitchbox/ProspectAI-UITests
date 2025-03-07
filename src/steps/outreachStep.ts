import { Page, expect } from '@playwright/test';
import { GeneralPage } from '../pages/generalPage';
import { OutreachePage } from '../pages/outreachPage';

export class OutreacheStep {
    readonly page: Page;
    readonly generalPage: GeneralPage;
    readonly pageLocators: OutreachePage;

    constructor(page: Page) {
        this.page = page;
        this.generalPage = new GeneralPage(page);
        this.pageLocators = new OutreachePage(page);
    }

    //#region 🔹 Actions
    async selectEmailItem(nameEmail: string) {
        const emailItem = this.pageLocators.addEmailItems.filter({ hasText: nameEmail });
        await expect(emailItem).toBeVisible();
        await emailItem.click();
    }

    async clickOnMenuActions(email: string) {
        await (await this.pageLocators.getMenuActions(email)).click();
    }

    async selectActionFromMenu(nameItem: string) {
        const item = this.pageLocators.itemsThreeDodsMenu.filter({ hasText: nameItem });
        await expect(item).toBeVisible();
        await item.click();
    }

    async fillInputFieldByLabel(nameField: string, value: string, index?: number) {

        const label = await this.pageLocators.getInputFieldByLabel(nameField);
        if (index) {
            await label.nth(index).isVisible();
            await label.nth(index).fill(value);
        }
        else {
            await label.isVisible();
            await label.fill(value);
        }
    }

    async clickOnFieldByLabel(nameField: string, index?: number) {
        const label = await this.pageLocators.getInputFieldByLabel(nameField);
        if (index) {
            await label.nth(index).click();
        }
        else {
            await label.click();
        }
    }

    async fillInputField(nameField: string, value: string, index: number) {
        const label = await this.pageLocators.getInputField(nameField, index);
        await label.fill(value);
    }

    async selectSSL_TLSDropdownItem(item: string) {
        const dropdownItem = await this.pageLocators.get_SSL_TLS_DropdownItems(item);
        await expect(dropdownItem).toBeVisible();
        await dropdownItem.click();
    }

    async getAllEmailAccount() {
        return (await (await this.pageLocators.getCells('email')).allInnerTexts()).map(email => email.split('\n').pop()?.trim() || '');
    }
    //#endregion

    //#region 🔹 Expect
    async expectPageTitleIs(expectedTitle: string) {
        const title = this.pageLocators.title.filter({ hasText: expectedTitle });
        await expect(title).toBeVisible({ timeout: 10000 });
    }

    async expectPageTitleWithWait(expectedText: string) {
        const title = await this.pageLocators.getTitleWithWait(expectedText);
        await expect(title).toBeVisible();
    }

    async expectTableHeaderArePresented(nameColumns: string[]) {
        for (const name of nameColumns) {
            await expect(this.pageLocators.tableHead.filter({ hasText: name })).toBeVisible();
        }
    }

    async expectEmailAccountIsPresented(nameColumn: string, accounts: string[]) {
        for (const account of accounts) {
            await expect((await this.pageLocators.getCells(nameColumn)).filter({ hasText: account })).toBeVisible({ timeout: 100000 });
        }
    }

    async expectEmailAccountIsNotPresented(nameColumn: string, accounts: string[]) {
        for (const account of accounts) {
            await expect((await this.pageLocators.getCells(nameColumn)).filter({ hasText: account })).not.toBeVisible();
        }
    }

    async expectItemByEmailAccount(email: string, nameColumn: string, value: string) {
        await expect((await this.pageLocators.getItemByEmailAccount(email, nameColumn))).toHaveText(value, { timeout: 600000 });
    }

    async expectCircularProgressHidden() {
        await expect(this.pageLocators.circularProgress).toBeHidden({ timeout: 60000 });
    }

    async expectStatusIs(email: string, status: string) {
        await expect(await this.pageLocators.getStatusByEmail(email)).toHaveText(status, { timeout: 100000 });
    }
    //#endregion
}