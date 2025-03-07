import { Page, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboardPage';

export class DashboardStep {
    readonly page: Page;
    readonly pageLocators: DashboardPage;

    constructor(page: Page) {
        this.page = page;
        this.pageLocators = new DashboardPage(page);
    }
}