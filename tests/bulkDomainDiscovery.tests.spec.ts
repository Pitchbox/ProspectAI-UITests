import { test } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { BulkDomainDiscoveryStep } from '../src/steps/bulkDomainDiscoveryStep';
import { ProspectListsStep } from '../src/steps/prospectListsStep';
import { ContactsStep } from '../src/steps/contactsStep';
import { logInData } from '../src/helpers/TestConstants';

test.describe.serial('When the user bulk search domains, all available information of corresponding company is displayed', () => {
    test.beforeEach(async ({ page }) => {
        const loginStep = new LoginStep(page);
        const generalStep = new GeneralStep(page);

        await generalStep.open();
        await loginStep.login(logInData.username, logInData.password);
        await generalStep.expectPageTitleIs("Dashboard");
    });

    test('When the user bulk search valid domains, the available information are displayed', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const bulkDomainDiscoveryStep = new BulkDomainDiscoveryStep(page);
        const prospectListsStep = new ProspectListsStep(page);
        const contactsStep = new ContactsStep(page);

        await test.step('Open Bulk Domain Discovery page', async () => {
            await generalStep.clickOnMainMenuButton('Domain Discovery', 'Bulk Search');
            await generalStep.expectCorrespondingUrl("/search#bulk");
        });

        await test.step('Search for the domains', async () => {
            await bulkDomainDiscoveryStep.fillInBulkDomains("https://www.petspurest.com/\nhttps://www.petdrugsonline.co.uk/");
            await bulkDomainDiscoveryStep.clickOnSearchButton();
        });

        await test.step('Expect corresponding title', async () => {
            const count = await generalStep.getCountOfFoundContacts();
            const text = `${count} Contacts Found`;
            await generalStep.expectPageTitleIs(text);
        });

        await test.step('Expect the corresponding items are in the result list of contacts', async () => {
            await generalStep.searchFor("petdrugsonline.co.uk");
            const tableLoaded = await contactsStep.theTableIsLoaded();
            if (tableLoaded) {
                await generalStep.expectItemsAreInTheList("domain", "petdrugsonline.co.uk");
            };
        });

        await test.step('Save selected items to the list', async () => {
            await generalStep.selectAllItems();
            await bulkDomainDiscoveryStep.saveCorrespondingContacts();
            await generalStep.expectModalIsShown("Save Contacts");
            await bulkDomainDiscoveryStep.saveItems();
            await generalStep.expectPopUpNotificationIs("Contacts have been added");
            await generalStep.closePopUpNotification();
        });

        await test.step('Export the list', async () => {
            const pathExportedList = './downloads/exportedBulkDomainList.csv';
            await generalStep.saveDownloadedFile(pathExportedList, 'Download');
            await generalStep.correspondingItemsAreDownloaded(pathExportedList, 'Email', "petdrugsonline.co.uk");
            await generalStep.deleteTheDownloadedFile(pathExportedList);
        });

        await test.step('Open Contacts page', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.openList("Default");
            await generalStep.expectPageTitleIs("Default");
        });

        await test.step('The companies with contacts are saved in a corresponding list', async () => {
            await generalStep.searchFor("petdrugsonline.co.uk");
            await generalStep.expectItemsAreInTheList("email", "petdrugsonline.co.uk");
        });
    });

    test('When the user deletes the contacts and the company from the list, the items are deleted', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const prospectListsStep = new ProspectListsStep(page);
        const contactsStep = new ContactsStep(page);

        await test.step('Open Contacts page', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.openList("Default");
            await generalStep.expectPageTitleIs("Default");
        });

        await test.step('Delete coresponding contacts from address book', async () => {
            await generalStep.searchFor("petdrugsonline.co.uk");
            const countRows = await contactsStep.getCoutnOfRows();

            if (countRows > 0) {
                await generalStep.selectAllItems();
                await generalStep.clickOnButton('Delete');
                await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
                await contactsStep.confirmDeleteContacts();
                await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
                await generalStep.closePopUpNotification();
            }

            await contactsStep.expectItemAreNotInList("email", ["petdrugsonline.co.uk"]);
        });

        await test.step('Delete the company from address book', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Companies');
            await generalStep.expectPageTitleIs("Companies");
            const countRows = await contactsStep.getCoutnOfRows();

            if (countRows > 0) {
                await generalStep.searchFor("petdrugsonline.co.uk");
                await generalStep.expectItemsAreInTheList("ag", "petdrugsonline.co.uk");
                await generalStep.selectAllItems();
                await generalStep.clickOnButton('Delete');
                await generalStep.expectModalIsShown("Are you sure you want to delete selected companies from the address book?");
                await contactsStep.confirmDeleteContacts();
                await generalStep.expectPopUpNotificationIs("Companies have been deleted");
                await generalStep.closePopUpNotification();
            }

            await contactsStep.expectItemAreNotInList('company', ["petdrugsonline.co.uk"]);
        });
    });
});
