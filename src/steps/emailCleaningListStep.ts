import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import { EmailListCleaningPage } from '../pages/emailCleaningListPage';
import * as readline from 'readline';

export class EmailCleaningListStep {
    readonly page: Page;
    readonly pageLocators: EmailListCleaningPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new EmailListCleaningPage(page);
    }

    async readCsv(filePath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const emails: string[] = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                    emails.push(row.email);
                })
                .on('end', () => resolve(emails))
                .on('error', (error) => reject(error));
        });
    }

    async csvDownloadHelper(filePath: string) {
        const fileStream = fs.createReadStream(filePath);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const results: string[][] = []

        for await (const line of rl) {
            const fields = line.split(',')
            results.push(fields)
        }

        return results
    }

    async saveDownloadedFile(filePath: string) {
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.pageLocators.downloadButton.filter({ hasText: 'Download' }).click()
        ]);

        await download.saveAs(filePath);
    }

    async deleteTheDownloadedFile(path: string) {
        if (path) {
            fs.unlinkSync(path);
        }
    }

    async expectItemsAreShownOnModal(filePath: string) {
        const emails = (await this.readCsv(filePath))
            .join('\n')
            .split(/\r?\n/)
            .map(email => email.trim());

        for (var i = 0; i < 4; i++) {
            const uploadedEmail = await this.pageLocators.getUploadedEmail(i + 1);
            expect(emails).toContain(await uploadedEmail.innerText());
        }
    }

    async correspondingEmailsAreShown(filePath: string) {
        const emails = (await this.readCsv(filePath))
            .join('\n')
            .split(/\r?\n/)
            .map(email => email.trim());
        const countOfRow = await this.getCountOfFoundContacts();
        expect(emails.length).toEqual(countOfRow);

        for (var i = 0; i < emails.length; i++) {
            var cellValue = (await this.pageLocators.chechboxEmailRow.nth(i).innerText());
            expect(emails).toContain(cellValue);
        }
    }

    async getCountOfFoundContacts() {
        const count = await this.pageLocators.countOfFoundContactsCell.innerText();
        return parseInt(count);
    }

    async selectedEmailsAreDownloaded(filePath: string, mass: string[]) {
        var emails = await this.readCsv(filePath);
        expect(emails.length).toBe(mass.length);

        for (var i = 0; i < mass.length; i++) {
            expect(emails).toContain(mass[i]);
        }
    }

    async uploadFile(filePath: string) {
        await this.pageLocators.inputFile.setInputFiles(filePath);
    }

    async expactFileIsUploaded(fileName: string) {
        await expect(this.pageLocators.fileInfo).toBeVisible();
        await expect(this.pageLocators.fileInfo).toContainText(fileName);
    }

    async clickOnCleanNewListButton() {
        await this.pageLocators.cleanNewListButton.first().click();
    }

    async enterListName(listName: string) {
        await this.pageLocators.nameListInput.fill(listName);
    }

    async clickOnNextStepButton() {
        await this.pageLocators.nextStepButton.click();
        await this.page.waitForTimeout(500);
    }

    async checkOnCheckBoxContainColumnHeader() {
        await this.pageLocators.checkBoxContainColumnHeader.check();
    }

    async checkFilteredResultCheckBox(filter: string) {
        const checkbox = await this.pageLocators.getFilteredResultCheckBox(filter);
        await checkbox.check();
    }

    async expectRecognizedEmailsIsShown(filePath: string) {
        const emailsCount = (await this.readCsv(filePath))
            .join('\n')
            .split(/\r?\n/)
            .map(email => email.trim())
            .filter(email => email.includes('@'))
            .length.toString();

        const resultField = this.pageLocators.recognizedEmailCount.filter({ hasText: `${emailsCount}` });
        await expect(resultField).toBeVisible();
    }

    async getAllLists() {
        return this.pageLocators.emailListHeader;
    }

    async expectCountOfLists(count: number) {
        expect(this.pageLocators.emailListHeader).toHaveCount(count, { timeout: 10000 });
    }

    async getListNameByIndex(text: string, index: number) {
        const allLists = this.pageLocators.emailListHeader;
        const listsDoNotContainText = allLists.filter({ hasNotText: text });
        return listsDoNotContainText.nth(index).innerText();
    }

    async expectEmailCleaningListsAreVisible(listNames: string[]) {
        for (const name of listNames) {
            expect(this.pageLocators.emailListHeader.filter({ hasText: name })).toBeVisible();
        }
    }

    async expectCorrespondingListsAreShown(expectedText: string) {
        const lists = this.pageLocators.emailListHeader;

        for (let i = 0; i < await lists.count(); i++) {
            await expect(lists.nth(i)).toContainText(expectedText, { timeout: 15000 });
        }
    }

    async expectListIsNotShown(header: string) {
        await expect(this.pageLocators.emailListHeader.filter({ hasText: header })).not.toBeVisible();
    }

    async editListName(oldListNama: string, newListName: string) {
        await this.pageLocators.emailListTitle.filter({ hasText: oldListNama }).hover();
        await (await this.pageLocators.getEditButtonByListName(oldListNama)).click();
        await this.pageLocators.editListNameInput.clear();
        await this.pageLocators.editListNameInput.fill(newListName);
        await this.pageLocators.saveListNameButton.click();
    }

    async clickOnActivityMenuByListName(listName: string) {
        const list = await this.pageLocators.getActionMenuByListName(listName);
        await list.click();
    }

    async archiveList() {
        await this.pageLocators.activityMenuItemArchived.click();
    }

    async deleteList() {
        await this.pageLocators.activityMenuItemDeleted.click();
    }

    async restoreList() {
        await this.pageLocators.activityMenuItemRestore.click();
    }

    async goToArchivedListsPage() {
        await this.pageLocators.goToArchivedListsPageButton.click();
    }

    async backToEmailCleaningListPage() {
        await this.pageLocators.backToEmailCleaningListPageButton.click();
    }

    async clickOnMenu(listName: string, buttonName: string) {
        await (await this.pageLocators.getMenuByListName(listName, buttonName)).click();
    }

    async clickOnViewResultsItem() {
        await this.pageLocators.viewResultsItem.click();
    }

    async clickOnDownloadResultsItem() {
        await this.pageLocators.downloadResultItem.click();
    }

    async clickOnAddToCRMItem() {
        await this.pageLocators.addToCRMItem.click();
    }

    async clickOnDownloadButtonOnResultTable() {
        await this.pageLocators.downloadButton.click();
    }

    async sortTableByColumn(columnName: string) {
        await this.pageLocators.headers.filter({ hasText: columnName }).click({ timeout: 10000 });
    }

    async expectTheItemsAreSorted(items: string[]) {
        const itemsInTable = this.pageLocators.chechboxEmailRow;
        await expect(itemsInTable).toHaveCount(items.length, { timeout: 10000 });

        for (var i = 0; i < items.length; i++) {
            expect(await itemsInTable.filter({ hasText: items[i] }).isVisible());
        }
    }

    async getAllUplodedEmails() {
        const emails = await this.pageLocators.chechboxEmailRow.allInnerTexts();
        return emails;
    }

    async chooseContactsBasedOnStatusChechbox(nameOfStatus: string) {
        await this.pageLocators.chooseContactsBasedOnStatusChechboxs.filter({ hasText: nameOfStatus }).click();
    }

    async clickOnAddEmailsButton() {
        await this.pageLocators.addEmailsButtonModal.click({ timeout: 10000 });
    }

    async expectEmailsInSelectedStatusIsDownloaded(filePath: string, status: string) {
        const file = (await this.csvDownloadHelper(filePath));
        file.shift();

        for (const row of file) {
            const cell = await this.pageLocators.getCellByName(row[0].replace(/^"(.*)"$/, '$1'), 'evStatus');
            const cellValue = await cell.innerText();
            expect(cellValue).toBe(status);
        }
    }
}