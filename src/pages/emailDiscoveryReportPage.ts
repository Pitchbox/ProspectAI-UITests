import { Page, Locator } from "@playwright/test";

export class EmailDiscoveryReportPage {
    readonly page: Page;
    readonly saveCompanyButton: Locator;
    readonly deleteList: Locator;
    readonly dropDownContent: Locator;
    readonly addToListButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.saveCompanyButton = page.getByRole('button', { name: 'Save' });
        this.dropDownContent = page.locator("div.select-multiple-chip-item")// list of all lists in dropdown
        this.deleteList = page.locator('svg.MuiChip-deleteIcon');
        this.addToListButton = page.getByRole('button', { name: 'Add to List' });
    }
}