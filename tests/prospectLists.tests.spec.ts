import { test } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { ProspectListsStep } from '../src/steps/prospectListsStep';
import { ContactsStep } from '../src/steps/contactsStep';
import { testDataListsPage } from '../src/helpers/TestConstants';

test.setTimeout(60000);

test.describe.serial("The user can perform the following actions with lists", () => {

    test.beforeEach(async ({ page }) => {
        const loginStep = new LoginStep(page);
        const generalStep = new GeneralStep(page);

        await generalStep.open();
        await loginStep.login(testDataListsPage.username, testDataListsPage.password);
        await generalStep.expectPageTitleIs("Dashboard");
    });

    test('When the user opens Lists page and deletes the test lists the lists are deleted', async ({ page }) => {
        const prospectListsStep = new ProspectListsStep(page);
        const generalStep = new GeneralStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
        });

        await test.step('When the user Clears the Address Book, the contacts are cleared', async () => {
            await prospectListsStep.cleanUpDeleteList("Address Book", "Clear List");
            await generalStep.expectModalIsShown("Are you sure you want to clear \"Address Book\" list?");
            await generalStep.expectPopUpNotificationIs("List cleared successfully.");
            await generalStep.closePopUpNotification();
        });

        await test.step('When the user Deletes all lists the lists are not shown', async () => {
            const testLists = await prospectListsStep.getAllTestLists('Test');
            await generalStep.clickOnSubMenuButton('Lists');
            for (const testList of testLists) {
                await prospectListsStep.cleanUpDeleteList(testList, "Delete List");
                await generalStep.expectModalIsShown(`Are you sure you want to delete "${testList}" list?`);
                await generalStep.expectPopUpNotificationIs("List deleted successfully.");
                await generalStep.closePopUpNotification();
            }

            await prospectListsStep.expectListsAreNotPresented('Test');
        });
    });

    test('When the user opens Lists page and creates New Lists the new lists are created', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
        });

        await test.step('When the user Deletes all lists the lists are not shown', async () => {
            await page.waitForTimeout(2000);
            const testLists = await prospectListsStep.getAllTestLists('Test');
            if (testLists !== null || testLists !== undefined) {
                for (const testList of testLists) {
                    await prospectListsStep.cleanUpDeleteList(testList, "Delete List");
                    await generalStep.expectModalIsShown(`Are you sure you want to delete "${testList}" list?`);
                    await generalStep.expectPopUpNotificationIs("List deleted successfully.");
                    await generalStep.closePopUpNotification();
                }
            }
            await prospectListsStep.expectListsAreNotPresented('Test');
        });

        await test.step('When the user creates New Lists, the new lists are created', async () => {
            // Create max avalable count of lists to check if the user can not create extra lists
            await generalStep.expectPageTitleIs("Lists");
            let createdLists: string[] = [];

            for (let i = 0; i < 4; i++) {
                if ((await prospectListsStep.getCountOfLists()) <= 5) {
                    await prospectListsStep.createList('Test ', i);
                    await generalStep.expectPopUpNotificationIs('List has been created');
                    await generalStep.closePopUpNotification();
                    await generalStep.expectModalIsNotShown('Create List');
                    createdLists.push(`Test ${i}`);
                }
                else {
                    await prospectListsStep.expectTitleMaxLimitIsPresented();
                    await prospectListsStep.expectNewListButtonIsDisabled();
                }
            }
            await prospectListsStep.expectListsArePresented(createdLists);
            await prospectListsStep.expectDefaultListShouldBeOne();
        });
    });

    test('When the user edits the list, the corresponding list is updated', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.expectListIsDefault('Default');
        });

        await test.step('When the user opens Lists page and edits the list the list is updated', async () => {
            await prospectListsStep.clickOnEditListButton('Test 1');
            await generalStep.expectModalIsShown('Edit List');
            await prospectListsStep.updateList('Test List With WebHook');
            await prospectListsStep.switchOnDefaultListChexbox();
            //await prospectListsStep.switchOnIntegrationItemCheckBox('Webhook'); //Todo add integration item
            //await prospectListsStep.fillWebHookName(expectedDataListsPage.webHookName);
            //await prospectListsStep.fillWebHookUrl(expectedDataListsPage.webHookUrl);
            //await prospectListsStep.clickOnSendTestButton();
            //await prospectListsStep.expectValidWebHookResponse();
            await prospectListsStep.clickOnSaveButton();
            await generalStep.expectPopUpNotificationIs('List has been updated');
            await generalStep.closePopUpNotification();
            await prospectListsStep.expectListIsDefault('Test List With WebHook');
        });

        await test.step('When the user opens Lists page and sets the list as default the list is set as default', async () => {
            await prospectListsStep.setListAsDefault('Default');
            await prospectListsStep.expectListIsDefault('Default');
            await prospectListsStep.expectDefaultListShouldBeOne();
        });

    });

    test('When the user exports the list on the Lists page the list is exported', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const prospectListsStep = new ProspectListsStep(page);
        const contactsStep = new ContactsStep(page);
        const pathExportedList = './downloads/exportedList.csv';

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
        });

        await test.step('When the user opens the corresponding list and adds contacts, the items are displayed in the Contacts table', async () => {
            await prospectListsStep.clickOnTheList('Default');
            await generalStep.expectPageTitleIs("Default");
            await contactsStep.clickOnAddContactButton();
            await contactsStep.fillInTheInputField('Email', testDataListsPage.exportedList[0]);
            await contactsStep.clickOnCreateContactButton();
            await generalStep.expectPopUpNotificationIs('Contact has been created successfully');
            await generalStep.closePopUpNotification();
            await generalStep.expectItemsAreInTheList('email', testDataListsPage.exportedList[0]);
        });

        await test.step('When the user opens Lists page and exports the list the list is downloaded', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.exportTheList(pathExportedList, 'Default');
            await generalStep.selectedEmailsAreDownloaded(pathExportedList, 'Email', testDataListsPage.exportedList);
            await generalStep.deleteTheDownloadedFile(pathExportedList);
        });

        await test.step('And the user Clears the Address Book, the contacts are cleared', async () => {
            await generalStep.clickOnSubMenuButton('Lists');
            await prospectListsStep.cleanUpDeleteList("Address Book", "Clear List");
            await generalStep.expectModalIsShown("Are you sure you want to clear \"Address Book\" list?");
            await generalStep.expectPopUpNotificationIs("List cleared successfully.");
            await generalStep.closePopUpNotification();
        });
    });
});