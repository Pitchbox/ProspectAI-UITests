import { Page, expect } from '@playwright/test';
import { SettingsPage } from '../pages/settingsPage';
import { GeneralStep } from './generalStep';
import { yearTeamTestData } from '../helpers/TestConstants';
import { MailSlurp } from 'mailslurp-client';

export class SettingsStep {
    readonly page: Page;
    readonly pageLocators: SettingsPage;
    readonly mailslurp: MailSlurp;
    readonly generalStep: GeneralStep;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new SettingsPage(page);
        this.generalStep = new GeneralStep(page);
        this.mailslurp = new MailSlurp({ apiKey: yearTeamTestData.apiKeyMailSlurp });
    }

    //#region 🔹 Navigation
    async gotoConfirmationLink(inboxId: string, text: string) {
        const cleanLink = await this.getConfirmationLink(inboxId, text);
        if (cleanLink) {
            await this.page.goto(cleanLink);
        }
        else {
            throw new Error("The link not found!");
        }
    }

    async gotoPrivacyPolicy() {
        await this.pageLocators.privacyPolicy.click();
    }
    //#endregion

    //#region 🔹 Actions
    async getConfirmationLink(inboxId: string, text: string) {
        const email = await this.getEmailWithWait(inboxId);
        expect(email.subject).toContain(text);
        const regex = /https?:\/\/[^\s<>"]+/g;
        const match = email.body ? email.body.match(regex) : [];
        let cleanLink: string = "";

        if (match) {
            const confirmationLink = match.find(link => link.includes("/Invite/")) || match[0];
            cleanLink = confirmationLink ? confirmationLink.replace(/["<>]/g, "") : "";
        }
        return cleanLink;
    }

    async createEmailInbox() {
        return await this.mailslurp.createInbox();
    }

    async getEmailWithWait(inboxId: string) {
        return await this.mailslurp.waitForLatestEmail(inboxId, 100000, false);
    }

    async getEmails(emailId: string) {
        return await this.mailslurp.getEmails(emailId);
    }

    async deleteInbox(inboxId: string) {
        await this.mailslurp.deleteInbox(inboxId);
    }

    async getAllInboxes() {
        const inboxes = await this.mailslurp.getAllInboxes();
        return inboxes;
    }

    async clearInbox(inboxId: string) {
        await this.mailslurp.emptyInbox(inboxId);
    }

    async getAllTestInboxEmails(inboxId: string) {
        return await this.mailslurp.getEmails(inboxId);
    }

    async getEmailByIndex(inboxId: string) {
        const email = await this.mailslurp.waitForNthEmail(inboxId, 0, 60000 * 2, false);
        return email;
    }

    async getRespons(nameButton: string) {
        const [response] = await Promise.all([
            this.page.waitForResponse((resp) => resp.url().includes("/web/user-team/invite/confirmation") && resp.status() === 200),
            this.generalStep.clickOnButton(nameButton)
        ]);
        return response;
    }

    async getTeamMember(member: string) {
        return this.pageLocators.teamMemberItems.filter({ hasText: member });
    }

    async clickOnCheckbox() {
        await this.pageLocators.checkbox.click();
    }

    async fillInInputField(item: string, value: string) {
        const input = await this.pageLocators.getTextboxByRole(item);
        await input.fill(value);
    }

    async clearInputField(item: string) {
        const input = await this.pageLocators.getTextboxByRole(item);
        await input.clear();
    }

    async clickOnPlanLink() {
        await this.pageLocators.planLink.click();
    }

    async getCurrenCredits() {
        return await this.pageLocators.creditsWrapper.textContent();
    }

    async getUsageSearchItemsInfo() {
        return await this.pageLocators.usageSearchItemInfo.allInnerTexts();
    }

    async getNumberByItem(element: string) {
        const searchItems = await this.getUsageSearchItemsInfo();
        if (searchItems.length !== 0) {
            const item = searchItems.find(item => item.includes(element));
            if (item) {
                const parts = item.trim().split('\n\n');
                const lastPart = parts[parts.length - 1];
                const match = lastPart.match(/\d+$/);
                return match ? match[0] : null;
            }
        }
        return null;
    }

    async clickOnReceipt(index: number) {
        const receipt = await this.pageLocators.getReceipt(index);
        await receipt.click();
    }

    async clickOnReceiptButtonAndCheckUrl(page: Page, expectedUrl: string, rowIndex: number): Promise<void> {
        const [newPage] = await Promise.all([
            page.waitForEvent('popup'),
            await (await this.pageLocators.getReceipt(rowIndex)).click()
        ]);

        await newPage.waitForLoadState('load');

        const newPageUrl = newPage.url();
        expect(newPageUrl).toContain(expectedUrl);
    }

    async clickOnButtonAndCheckUrl(page: Page, expectedUrl: string, nameButton: string): Promise<void> {
        const [newPage] = await Promise.all([
            page.waitForEvent('popup'),
            await this.generalStep.clickOnButton(nameButton)
        ]);

        await newPage.waitForLoadState('load');

        const newPageUrl = newPage.url();
        expect(newPageUrl).toContain(expectedUrl);
    }

    async clickOnSwitcherPosition(item: string) {
        await this.pageLocators.switcherPayMonthlyBuyCredits.filter({ hasText: item }).click();
    }

    async selectSubscriptionPlan(item: string) {
        await this.pageLocators.subscriptionItems.filter({ hasText: item }).getByText('Select').click();
    }

    async clickOnTheCurrentSubscription(activePlan: string) {
        await this.pageLocators.subscriptionItems.filter({ hasText: activePlan }).click();
    }

    async deleteApiKeys(nameOfButton: string, apiKeyName: string) {
        const apiKeys = await this.pageLocators.apiKeyTitles.allInnerTexts();
        for (const key of apiKeys) {
            if (key.includes(apiKeyName)) {
                await this.clickOnActionButtonCorrespondingApiKey(nameOfButton, apiKeyName);
                await this.generalStep.expectModalIsShown(`Are you sure you want to delete ${key} API key?`);
                await this.generalStep.clickOnButton('Delete');
                await this.generalStep.expectPopUpNotificationIs('API Key has been deleted!');
                await this.generalStep.closePopUpNotification();
            }
        }
    }

    async clickOnCopyButtonCorrespondingApiKey(nameOfButton: string, apiKeyName: string) {
        const apiKey = this.pageLocators.apiKeyContant.filter({ hasText: apiKeyName });
        await apiKey.hover();
        await expect(apiKey.getByRole('button')).toBeVisible({ timeout: 3000 });
        await apiKey.getByRole('button').getByLabel(nameOfButton).click();
    }

    //Delete and Edit
    async clickOnActionButtonCorrespondingApiKey(nameOfButton: string, apiKeyName: string) {
        const apiKey = this.pageLocators.apiKeyContant.filter({ hasText: apiKeyName });
        await apiKey.hover();
        await expect(apiKey.getByRole('img', { name: nameOfButton })).toBeVisible({ timeout: 3000 });
        await apiKey.getByRole('img', { name: nameOfButton }).click();
    }
    //#endregion

    //#region 🔹 Expectation
    async expectYearTeamContentIsVisible() {
        await expect(this.pageLocators.contentWrapper).toBeVisible();
        await expect(this.pageLocators.contentWrapper.filter({ hasText: "Invite other team members and enjoy prospecting together." })).toBeVisible();
    }

    async expectTeamMembersAre(members: string[]) {
        const teamMembers = this.pageLocators.teamMemberItems;
        for (const member of members) {
            await expect(teamMembers.filter({ hasText: member })).toBeVisible();
        }
    }

    async expectTeamMemberIsNotShown(member: string) {
        const teamMembers = this.pageLocators.teamMemberItems;
        await expect(teamMembers.filter({ hasText: member })).not.toBeVisible();
    }

    async expectTermsThanksForJoiningPageIsVisible() {
        await expect(this.pageLocators.termsThanksForJoiningPage.filter({ hasText: 'Thanks for joining ProspectAI' })).toBeVisible();
        await expect(this.pageLocators.termsThanksForJoiningPage.filter({ hasText: 'I read and agree to the' })).toBeVisible();
    }

    async expectRoleDropdownIs(role: string) {
        await expect(this.pageLocators.inputRoleDropdown).toHaveValue(role);
    }

    async expectTeamMembersRoleIs(member: string, role: string) {
        await expect(await this.pageLocators.getUserRole(member)).toHaveText(role.toLowerCase());
    };

    async expectCreditsInfoAre(data: string[]) {
        for (const item of data) {
            await expect(this.pageLocators.creditsWrapper).toBeVisible();
            await expect(this.pageLocators.creditsWrapper).toContainText(item);
        }
    }

    async expectUsageSearchItemsAre(items: string[], count?: string[]) {
        for (var i = 0; i < items.length; i++) {
            await expect(this.pageLocators.usageSearchItemInfo.filter({ hasText: items[i] })).toBeVisible();
            if (count) {
                await expect(this.pageLocators.usageSearchItemInfo.filter({ hasText: items[i] })).toContainText(count[i]);
            }
        }
    }

    async expectContentBlockAre(blocks: string[]) {
        for (const block of blocks) {
            await expect(this.pageLocators.billingContent).toBeVisible();
            await expect(this.pageLocators.billingContent).toContainText(block);
        }
    }
    async expectPaymentHistoryGridWithFollowingColumnsIsVisible(columns: string[]) {
        await expect(this.pageLocators.gridPaymentHistory).toBeVisible();
        for (const column of columns) {
            await expect(await this.pageLocators.getColumn(column)).toBeVisible();
        }
    }

    async expectValueOfRowEmailHistoryAre(index: number, values: string[]) {
        const columns = ['created', 'amount', 'status'];
        for (var i = 0; i < columns.length; i++) {
            const cell = await this.pageLocators.getCellsPaymentHistoryByColumn(columns[i], index);
            await expect(cell).toHaveText(values[i]);
        }
    }

    async exepectBillingDetails(email: string) {
        await expect(this.pageLocators.billingDetails).toHaveText(email);
    }

    async expectPaymentMethodsAre(texts: string[]) {
        for (const text of texts) {
            await expect(this.pageLocators.paymentMethod).toContainText(text);
        }
    }

    async expectPaymentHistoryReceiptButtonIsVisible(index: number) {
        const receipt = await this.pageLocators.getReceipt(index);
        await expect(receipt).toBeVisible();
    }

    async expectActiveSwitcherPositionIs(item: string) {
        await expect(this.pageLocators.switcherPayMonthlyBuyCredits.filter({ hasText: item })).toHaveClass('tab-item tab-item-active');
    }

    async expectSubscriptionPlansWithPricesAre(items: string[], prices: string[]) {
        for (const item of items) {
            await expect(this.pageLocators.subscriptionItems.filter({ hasText: item })).toBeVisible();
            await expect(this.pageLocators.subscriptionItems.filter({ hasText: item })).toContainText(prices[items.indexOf(item)]);
        }
    }

    async expectDisabledSubscriptionItemIs(items: string[]) {
        for (const item of items) {
            await expect(this.pageLocators.subscriptionItems.filter({ hasText: item })).toHaveClass('subscription-item disabled');
        }
    }

    async expectCurrentSubscriptionItemIs(item: string) {
        await expect(this.pageLocators.subscriptionItems.filter({ hasText: item })).toHaveClass('subscription-item active');
    }

    async expectActiveSubscriptionIsShown(item: string, credits: string) {
        await expect(this.pageLocators.activeSubscription).toBeVisible();
        await expect(this.pageLocators.activeSubscription).toContainText(item);
        await expect(this.pageLocators.activeSubscription).toContainText(credits);
    }

    async expectCreditsAreAvailable(credits: string) {
        await expect(this.pageLocators.creditsAvailable).toBeVisible();
        await expect(this.pageLocators.creditsAvailable).toContainText('Credits available');
        await expect(this.pageLocators.creditsAvailable).toContainText(` of ${credits}`);
        await expect(this.pageLocators.creditsAvailable).toContainText('Credits Reset: ');
    }

    async expectDeleteAccountItemIsAvalable() {
        await expect(this.pageLocators.deleteAccountItem).toBeVisible();
        await expect(this.pageLocators.deleteAccountItem).toContainText('Delete account');
    }

    async expectAPIKeysContentIsVisible(keyName: string) {
        const apiKey = this.pageLocators.apiKeyContant.filter({ hasText: keyName }).first();
        await expect(apiKey).toBeVisible();
        await expect(apiKey).toContainText('Created: ');
        await expect(apiKey).toContainText('Expire:');
    }

    async expectAPIKeysIsNotVisible(keyName: string) {
        const apiKey = this.pageLocators.apiKeyContant.filter({ hasText: keyName });
        await expect(apiKey).not.toBeVisible();
    }


    async expectAPIKeysAreNotExpired(keyName: string) {
        const apiKeyExpire = await (await this.pageLocators.getApiKeyInfoExpire(keyName)).innerText();
        console.log(`API Key: ${apiKeyExpire}`);
        const expirationDate = new Date(apiKeyExpire);
        const currentDate = new Date();
        expect(expirationDate.getTime()).toBeGreaterThan(currentDate.getTime());
    }
    //#endregion
}