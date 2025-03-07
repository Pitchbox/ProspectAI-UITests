import { Page, Locator } from "@playwright/test";

export class DashboardPage {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }
}