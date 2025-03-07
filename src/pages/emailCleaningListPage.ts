import { Page, Locator } from "@playwright/test";

export class EmailListCleaningPage {
    readonly page: Page;
    readonly inputFile: Locator;
    readonly uploadField: Locator;
    readonly cleanNewListButton: Locator;
    readonly nameListInput: Locator;
    readonly nextStepButton: Locator;
    readonly checkBoxContainColumnHeader: Locator;
    readonly fileInfo: Locator;
    readonly recognizedEmailCount: Locator;
    readonly emailListHeader: Locator;
    readonly editListNameIcon: Locator;
    readonly editListNameInput: Locator;
    readonly saveListNameButton: Locator;
    readonly activityMenu: Locator;
    readonly activityMenuItemArchived: Locator;
    readonly activityMenuItemDeleted: Locator;
    readonly activityMenuItemRestore: Locator;
    readonly goToArchivedListsPageButton: Locator;
    readonly backToEmailCleaningListPageButton: Locator;
    readonly viewResultsItem: Locator;
    readonly downloadResultItem: Locator;
    readonly addToCRMItem: Locator;
    readonly cellEmail: Locator;
    readonly checkboxes: Locator;
    readonly chechboxEmailRow: Locator;
    readonly headers: Locator;
    readonly downloadButton: Locator;
    readonly chooseContactsBasedOnStatusChechboxs: Locator;
    readonly addEmailsButtonModal: Locator;
    readonly countOfFoundContactsCell: Locator;
    readonly emailListTitle: Locator;
    readonly completedVerificationList: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inputFile = page.locator('input[type="file"]');
        this.uploadField = page.locator('div').filter({ hasText: /^Click to upload or drag and dropCSV or XLS \(max\. 3MB\)$/ }).first();
        this.cleanNewListButton = page.locator('button.MuiButton-root.css-1swobnk');
        this.nameListInput = page.getByPlaceholder('List Name');
        this.nextStepButton = page.getByRole('button', { name: 'Next Step' });
        this.checkBoxContainColumnHeader = page.getByLabel('controlled');
        this.recognizedEmailCount = page.locator('div.contacts-found-wrapper > p');
        this.fileInfo = page.locator('div[class="file-info"]');
        this.emailListHeader = page.locator('div.verification-list-header');
        this.emailListTitle = page.locator('div.title-show-mode');
        this.editListNameIcon = page.locator('div > [aria-label="Edit"]');
        this.editListNameInput = page.getByPlaceholder('Name');
        this.saveListNameButton = page.locator('button.check-icon-button');
        this.activityMenu = page.locator('.menu-wrapper > .MuiButtonBase-root');
        this.activityMenuItemArchived = page.getByRole('menuitem', { name: 'Archive' });
        this.activityMenuItemDeleted = page.getByRole('menuitem', { name: 'Delete' });
        this.activityMenuItemRestore = page.getByRole('menuitem', { name: 'Restore' });
        this.goToArchivedListsPageButton = page.locator('div.archived-title-wrapper');
        this.backToEmailCleaningListPageButton = page.locator('div.arrow-back-wrapper');
        this.viewResultsItem = page.locator('li.MuiMenuItem-gutters', { hasText: 'View Results' });
        this.downloadResultItem = page.locator('li.MuiMenuItem-gutters', { hasText: 'Download' });
        this.addToCRMItem = page.locator('li.MuiMenuItem-gutters', { hasText: 'Add to CRM' });
        this.cellEmail = page.locator('div[col-id="email"]');
        this.checkboxes = page.locator('div.ag-cell-wrapper .ag-checkbox');
        this.chechboxEmailRow = page.locator('div.ag-cell-wrapper');
        this.headers = page.locator('.ag-cell-label-container');
        this.downloadButton = page.locator('button.MuiButton-root');
        this.chooseContactsBasedOnStatusChechboxs = page.locator('span.MuiTypography-root');
        this.addEmailsButtonModal = page.getByRole('button', { name: 'Add', exact: true });
        this.countOfFoundContactsCell = page.locator('div span[ref="lbRecordCount"]');
        this.completedVerificationList = page.locator("div.completed-verification-list-wrapper");
    }

    async waitForLocators(expectNumberOfLists: number) {
        await this.page.waitForSelector('div.title-show-mode');
        await this.page.waitForFunction(() => document.querySelectorAll('div.title-show-mode').length === expectNumberOfLists);
    }

    async getFilteredResultCheckBox(filter: string) {
        return this.page.getByLabel(filter);
    }

    async getUploadedEmail(number: number) {
        return this.page.locator(`div:nth-child(1) > div.column-values-wrapper > p:nth-child(${number})`);
    }

    async getCheckboxByEmail(selector: Locator, email: string) {
        const emailRow = selector.filter({ hasText: email });
        return emailRow.locator('input[type="checkbox"]');
    }

    async getCellByName(email: string, nameColumn: string) {
        const row = await this.getRowByEmail(email);
        return row.locator(`div.ag-cell[col-id="${nameColumn}"]`);
    }

    async getRowByEmail(email: string) {
        return this.page.locator(`div.ag-row`).filter({ hasText: email });
    }

    async getEditButtonByListName(listName: string) {
        const list = this.emailListTitle.filter({ hasText: listName });
        return list.getByLabel('Edit');
    }

    async getEditInputByListName(listName: string) {
        return this.page.locator('div.title-edit-mode').filter({ hasText: listName }).getByPlaceholder('Name');
    }

    async getActionMenuByListName(listName: string) {
        return this.emailListHeader.filter({ hasText: listName }).locator('.menu-wrapper > .MuiButtonBase-root');
    }

    async getMenuByListName(listName: string, buttonName: string) {
        return this.completedVerificationList.filter({ hasText: listName }).getByRole('button', { name: buttonName })
    }
}