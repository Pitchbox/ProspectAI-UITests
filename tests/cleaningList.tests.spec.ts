import { expect, test } from '@playwright/test';
import { LoginStep, } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { EmailCleaningListStep } from '../src/steps/emailCleaningListStep';
import { ContactsStep } from '../src/steps/contactsStep';
import { emailCleaningListTestData } from '../src/helpers/TestConstants';
import { ProspectListsStep } from '../src/steps/prospectListsStep';

test.beforeEach(async ({ page }) => {
    const loginStep = new LoginStep(page);
    const generalStep = new GeneralStep(page);

    await test.step('Navigate to the application', async () => {
        await generalStep.open();
        await loginStep.login(emailCleaningListTestData.username, emailCleaningListTestData.password);
        await generalStep.expectPageTitleIs("Dashboard");
    });

    await test.step('Open Email Verification List Cleaning page', async () => {
        await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
        await generalStep.expectCorrespondingUrl("/list-cleaning");
        await generalStep.expectPageTitleIs("Email List Cleaning");
    });
});

test.describe.serial('When the user opens Email Cleaning List page the user can upload, rename, delete the list', async () => {
    test('When the user deletes corresponding list, the list is not shown on Email Cleaning List page', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);

        await test.step('When the user Deletes the list', async () => {
            await generalStep.waitForProgressBarIsHidden();
            const allLists = await emailCleaningListStep.getAllLists();
            const allListTexts = await allLists.allInnerTexts();
            const emailCleaningLists = [emailCleaningListTestData.newListName, emailCleaningListTestData.uploadedEmailCleaningList];
            for (const list of emailCleaningLists) {
                if (allListTexts.includes(list)) {
                    await emailCleaningListStep.clickOnActivityMenuByListName(list);
                    await emailCleaningListStep.deleteList();
                    await generalStep.expectPopUpNotificationIs("List has been deleted");
                    await generalStep.closePopUpNotification();
                }
            }
        });

        await test.step('The corresponding list is not displayed on the Email Cleaning List page', async () => {
            await emailCleaningListStep.expectListIsNotShown(emailCleaningListTestData.newListName);
            await emailCleaningListStep.expectListIsNotShown(emailCleaningListTestData.uploadedEmailCleaningList);
        });
    });

    test('When the user uploads a CSV file, the cleaning list is generated.', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const filePath = './listCleaningEmails.csv';

        await test.step('When the user clicks on Clean New list button', async () => {
            await emailCleaningListStep.clickOnCleanNewListButton();
        });

        await test.step('And Upload a CSV file', async () => {
            await generalStep.expectModalIsShown("Upload File");
            await emailCleaningListStep.enterListName(emailCleaningListTestData.uploadedEmailCleaningList);
            const fileName = filePath.split('/').pop();
            await emailCleaningListStep.uploadFile(filePath);
            await emailCleaningListStep.expactFileIsUploaded(`${fileName}`);
        });

        await test.step('Click on Next Step button', async () => {
            await emailCleaningListStep.clickOnNextStepButton();
            await generalStep.expectModalIsShown("Match the columns in your file");
        });

        await test.step('Select the checkbox that contains the column header', async () => {
            await emailCleaningListStep.checkOnCheckBoxContainColumnHeader();
        });

        await test.step('Some items from the uploaded file are expected to be displayed', async () => {
            await emailCleaningListStep.expectItemsAreShownOnModal(filePath);
        });

        await test.step('Expected count of emails is shown', async () => {
            await emailCleaningListStep.expectRecognizedEmailsIsShown(filePath);
        });

        await test.step('Click on Next Step button', async () => {
            await emailCleaningListStep.clickOnNextStepButton();
            await generalStep.expectModalIsShown("Import in progress...");
            await generalStep.clickOnButton('Close');
            await generalStep.expectModalIsNotShown("Import in progress...");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('The created email cleaning list is shown', async () => {
            await emailCleaningListStep.expectEmailCleaningListsAreVisible([emailCleaningListTestData.uploadedEmailCleaningList]);
        });
    });

    test('When the user edits the name of the list, the renamed list is shown on Email Cleaning List page', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);

        await test.step('When the user Edits the list name', async () => {
            await emailCleaningListStep.expectEmailCleaningListsAreVisible([emailCleaningListTestData.uploadedEmailCleaningList]);
            await emailCleaningListStep.editListName(emailCleaningListTestData.uploadedEmailCleaningList,
                emailCleaningListTestData.newListName);
        });

        await test.step('The list is shown with the new name', async () => {
            await generalStep.expectPopUpNotificationIs("Name has been updated");
            await generalStep.closePopUpNotification();
            await emailCleaningListStep.expectEmailCleaningListsAreVisible([emailCleaningListTestData.newListName]);
            await emailCleaningListStep.expectListIsNotShown(emailCleaningListTestData.uploadedEmailCleaningList);
        });
    });
});

test.describe('The user can perform the following actions with the corresponding list', () => {
    test("When the user searchs corresponding list on Email Cleaning List page, the list is shown", async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        let initialCountOfLists = 0;

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('Email cleaning lists are shown on Email Cleaning List page', async () => {
            await emailCleaningListStep.expectEmailCleaningListsAreVisible(emailCleaningListTestData.emailCleaningLists);
            initialCountOfLists = await (await emailCleaningListStep.getAllLists()).count();
        });

        await test.step('Search for the list with digits', async () => {
            await generalStep.searchFor('1');
            await emailCleaningListStep.expectCountOfLists(3);
            await emailCleaningListStep.expectCorrespondingListsAreShown('1');
        });

        await test.step('Search for the list with letters', async () => {
            await generalStep.searchFor('Test');
            await emailCleaningListStep.expectCountOfLists(3);
            await emailCleaningListStep.expectCorrespondingListsAreShown('Test');
        });

        await test.step('Search for the list with digits+letter', async () => {
            await generalStep.searchFor('1Q');
            await page.waitForTimeout(15000);
            await emailCleaningListStep.expectCountOfLists(2);
            await emailCleaningListStep.expectCorrespondingListsAreShown('1Q');
        });
    });

    test('When the user archives corresponding list the list is shown on Archived Email List Cleaning Page', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('Archive the list', async () => {
            await emailCleaningListStep.clickOnActivityMenuByListName(emailCleaningListTestData.archivedTestList);
            await emailCleaningListStep.archiveList();
            await generalStep.expectPopUpNotificationIs("List has been archived");
            await generalStep.closePopUpNotification();
            await emailCleaningListStep.expectListIsNotShown(emailCleaningListTestData.archivedTestList);
        });

        await test.step('"Archived Email List Cleaning" page contains the archived list', async () => {
            await emailCleaningListStep.goToArchivedListsPage();
            await generalStep.expectPageTitleIs('Archived Email List Cleaning');
        });

        await test.step('Restore the list', async () => {
            await emailCleaningListStep.clickOnActivityMenuByListName(emailCleaningListTestData.archivedTestList);
            await emailCleaningListStep.restoreList();
            await generalStep.expectPopUpNotificationIs("List has been restored");
            await generalStep.closePopUpNotification();
            await emailCleaningListStep.backToEmailCleaningListPage();
            await generalStep.expectPageTitleIs('Email List Cleaning');
            await emailCleaningListStep.expectEmailCleaningListsAreVisible([emailCleaningListTestData.archivedTestList]);
        });
    });

    test('When the user selects View Result item from Results menu, the email cleaning results are displayed correctly', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const filePath = './listCleaningEmails.csv';
        const downloadPath = './downloads/downloadEmails.csv';

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('View the results of the list', async () => {
            await emailCleaningListStep.clickOnMenu('qa', 'Results');
            await emailCleaningListStep.clickOnViewResultsItem();
            await generalStep.expectPageTitleIs('qa');
        });

        await test.step('The results of the email cleaning list are shown on the table', async () => {
            await emailCleaningListStep.correspondingEmailsAreShown(filePath);
        });

        await test.step('When the user sorts the items by Email column by ascending order the table is sorted', async () => {
            await emailCleaningListStep.sortTableByColumn('Email');
            await emailCleaningListStep.expectTheItemsAreSorted(emailCleaningListTestData.expectedEmailsListSortedByAscending);
        });

        await test.step('When the user sorts the items by Email column by descending order the table is sorted', async () => {
            const emails = await emailCleaningListStep.getAllUplodedEmails()
            await emailCleaningListStep.sortTableByColumn('Email');
            await emailCleaningListStep.expectTheItemsAreSorted(emailCleaningListTestData.expectedEmailsListSortedByDescending);
        });

        await test.step('When the user downloads corresponding emails, the list of emails is downloaded', async () => {
            var cleaningList = await emailCleaningListStep.readCsv(filePath);
            await generalStep.checkTheChechbox(cleaningList[2]);
            await generalStep.checkTheChechbox(cleaningList[8]);
            await generalStep.saveDownloadedFile(downloadPath, 'Download');
            await emailCleaningListStep.selectedEmailsAreDownloaded(downloadPath, [cleaningList[2], cleaningList[8]]);
            await generalStep.deleteTheDownloadedFile(downloadPath);
        });
    });

    test('When the user downloads Valid emails via Results menu the corresponding emails are downloaded', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const pathDownloadEmailsPathInSelectedStatus = './downloads/downloadEmailsInSelectedStatus.csv';

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('Download the results of the list', async () => {
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForDownload, 'Results');
            await emailCleaningListStep.clickOnDownloadResultsItem();
            await generalStep.expectModalIsShown('Download Results');
        });

        await test.step('When the user checkes Download Valid checkbox in Download Results modal window then emails with Valid status are downloaded', async () => {
            await emailCleaningListStep.chooseContactsBasedOnStatusChechbox('Download Valid');
            await generalStep.saveDownloadedFile(pathDownloadEmailsPathInSelectedStatus, 'Download');
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForDownload, 'Results');
            await emailCleaningListStep.clickOnViewResultsItem();
            await emailCleaningListStep.expectEmailsInSelectedStatusIsDownloaded(pathDownloadEmailsPathInSelectedStatus, 'Valid');
            await emailCleaningListStep.backToEmailCleaningListPage();
            await generalStep.expectPageTitleIs('Email List Cleaning');
            await emailCleaningListStep.selectedEmailsAreDownloaded(pathDownloadEmailsPathInSelectedStatus, emailCleaningListTestData.expectedListValidEmails);
            await generalStep.deleteTheDownloadedFile(pathDownloadEmailsPathInSelectedStatus);
        });
    });

    test('When the user downloads Catch-All emails via Results menu the corresponding emails are downloaded', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const pathDownloadEmailsPathInSelectedStatus = './downloads/downloadEmailsInSelectedStatus.csv';

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('Download the results of the list', async () => {
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForDownload, 'Results');
            await emailCleaningListStep.clickOnDownloadResultsItem();
            await generalStep.expectModalIsShown('Download Results');
        });

        await test.step('When the user checkes Download Catch-All checkbox in Download Results modal window then emails with Catch-All status are downloaded', async () => {
            await emailCleaningListStep.chooseContactsBasedOnStatusChechbox('Download Catch-All');
            await generalStep.saveDownloadedFile(pathDownloadEmailsPathInSelectedStatus, 'Download');
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForDownload, 'Results');
            await emailCleaningListStep.clickOnViewResultsItem();
            await emailCleaningListStep.expectEmailsInSelectedStatusIsDownloaded(pathDownloadEmailsPathInSelectedStatus, 'Catch-all');
            await emailCleaningListStep.backToEmailCleaningListPage();
            await generalStep.expectPageTitleIs('Email List Cleaning');
            await emailCleaningListStep.selectedEmailsAreDownloaded(pathDownloadEmailsPathInSelectedStatus, emailCleaningListTestData.expectedListCatchAllEmails);
            await generalStep.deleteTheDownloadedFile(pathDownloadEmailsPathInSelectedStatus);
        });
    });

    test('When the user downloads Unknown emails via Results menu the corresponding emails are downloaded', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const pathDownloadEmailsPathInSelectedStatus = './downloads/downloadEmailsInSelectedStatus.csv';

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('Download the results of the list', async () => {
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForDownload, 'Results');
            await emailCleaningListStep.clickOnDownloadResultsItem();
            await generalStep.expectModalIsShown('Download Results');
        });

        await test.step('When the user checkes Download Unknown checkbox in Download Results modal window then emails with Unknown status are downloaded', async () => {
            await emailCleaningListStep.chooseContactsBasedOnStatusChechbox('Download Unknown');
            await generalStep.saveDownloadedFile(pathDownloadEmailsPathInSelectedStatus, 'Download');
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForDownload, 'Results');
            await emailCleaningListStep.clickOnViewResultsItem();
            await emailCleaningListStep.expectEmailsInSelectedStatusIsDownloaded(pathDownloadEmailsPathInSelectedStatus, 'Unknown');
            await emailCleaningListStep.backToEmailCleaningListPage();
            await generalStep.expectPageTitleIs('Email List Cleaning');
            await emailCleaningListStep.selectedEmailsAreDownloaded(pathDownloadEmailsPathInSelectedStatus, emailCleaningListTestData.expectListUnknownEmails);
            await generalStep.deleteTheDownloadedFile(pathDownloadEmailsPathInSelectedStatus);
        });
    });

    test('When the user downloads Invalid emails via Results menu the corresponding emails are downloaded', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const pathDownloadEmailsPathInSelectedStatus = './downloads/downloadEmailsInSelectedStatus.csv';

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('The Email cleaning list is shown', async () => {
            await emailCleaningListStep.expectEmailCleaningListsAreVisible([emailCleaningListTestData.testListForDownload]);
        });

        await test.step('Download the results of the list', async () => {
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForDownload, 'Results');
            await emailCleaningListStep.clickOnDownloadResultsItem();
            await generalStep.expectModalIsShown('Download Results');
        });

        await test.step('When the user checkes Download Invalid checkbox in Download Results modal window then emails with Valid status are downloaded', async () => {
            await emailCleaningListStep.chooseContactsBasedOnStatusChechbox('Download Invalid');
            await generalStep.saveDownloadedFile(pathDownloadEmailsPathInSelectedStatus, 'Download');
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForDownload, 'Results');
            await emailCleaningListStep.clickOnViewResultsItem();
            await emailCleaningListStep.expectEmailsInSelectedStatusIsDownloaded(pathDownloadEmailsPathInSelectedStatus, 'Invalid');
            await emailCleaningListStep.backToEmailCleaningListPage();
            await generalStep.expectPageTitleIs('Email List Cleaning');
            await emailCleaningListStep.selectedEmailsAreDownloaded(pathDownloadEmailsPathInSelectedStatus, emailCleaningListTestData.expectedListInvalidEmails);
            await generalStep.deleteTheDownloadedFile(pathDownloadEmailsPathInSelectedStatus);
        });
    });
});

test.describe('When the user adds to CRM the cleaning emails, the emails are added to CRM', () => {
    test('When the user adds to CRM the Valid emails, the emails are added to CRM', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const contactsStep = new ContactsStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('Search for the list', async () => {
            await generalStep.searchFor(emailCleaningListTestData.testListForSelectedEmails);
            await emailCleaningListStep.expectCorrespondingListsAreShown(emailCleaningListTestData.testListForSelectedEmails);
        });

        await test.step('Go to Add to CRM modal window', async () => {
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForSelectedEmails, 'Add to');
            await emailCleaningListStep.clickOnAddToCRMItem();
            await generalStep.expectModalIsShown('Add Contacts to CRM');
        });

        await test.step('Add the emails with Valid status to new list to CRM', async () => {
            await emailCleaningListStep.chooseContactsBasedOnStatusChechbox('Add Valid');
            await generalStep.createNewList("ValidList");
            await generalStep.addList("ValidList");//And selects the list from the dropdown
        });

        await test.step('Add the emails with Valid status to the CRM', async () => {
            await emailCleaningListStep.clickOnAddEmailsButton();
            await generalStep.expectPopUpNotificationIs('Contacts added successfully');
            await generalStep.closePopUpNotification();
            await generalStep.expectPageTitleIs('Email List Cleaning');
        });

        await test.step('Open Contacts page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.openList("ValidList");
            await generalStep.expectPageTitleIs("ValidList");
        });

        await test.step('The valid emails are saved in Contacts', async () => {
            await contactsStep.expectCountOfItemIsPresented('email', emailCleaningListTestData.expectedListValidEmails);
            await contactsStep.expectItemsAreInList('email', emailCleaningListTestData.expectedListValidEmails);
        });

        await test.step('Delete the contacts', async () => {
            await contactsStep.clickOnToggleAllCheckbox();
            await contactsStep.delateSelectedContactsFromAddressBook();
            await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
            await contactsStep.confirmDeleteContacts();
            await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
            await generalStep.closePopUpNotification();
        });

        await test.step('Delete the list', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            await prospectListsStep.cleanUpDeleteList(emailCleaningListTestData.validListName, "Delete List");
            await generalStep.expectModalIsShown("Are you sure you want to delete \"ValidList\" list?");
            await generalStep.expectPopUpNotificationIs("List deleted successfully.");
            await generalStep.closePopUpNotification();
        });
    });

    test('When the user adds to CRM the Invalid emails, the emails are added to CRM', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const contactsStep = new ContactsStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('Search for the list', async () => {
            await generalStep.searchFor(emailCleaningListTestData.testListForSelectedEmails);
            await emailCleaningListStep.expectCorrespondingListsAreShown(emailCleaningListTestData.testListForSelectedEmails);
        });

        await test.step('Go to Add to CRM modal window', async () => {
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForSelectedEmails, 'Add to');
            await emailCleaningListStep.clickOnAddToCRMItem();
            await generalStep.expectModalIsShown('Add Contacts to CRM');
        });

        await test.step('Add the emails with Invalid status to new list to CRM', async () => {
            await emailCleaningListStep.chooseContactsBasedOnStatusChechbox('Add Invalid');
            await generalStep.createNewList(emailCleaningListTestData.invalidListName);
            await generalStep.addList(emailCleaningListTestData.invalidListName);//And selects the list from the dropdown
        });

        await test.step('Add the emails with Invalid status to the CRM', async () => {
            await emailCleaningListStep.clickOnAddEmailsButton();
            await generalStep.expectPopUpNotificationIs('Contacts added successfully');
            await generalStep.closePopUpNotification();
            await generalStep.expectPageTitleIs('Email List Cleaning');
        });

        await test.step('Open Contacts page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.openList(emailCleaningListTestData.invalidListName);
            await generalStep.expectPageTitleIs(emailCleaningListTestData.invalidListName);
        });

        await test.step('The invalid emails are saved in Contacts', async () => {
            await contactsStep.expectCountOfItemIsPresented('email', emailCleaningListTestData.expectedListInvalidEmails);
            await contactsStep.expectItemsAreInList('email', emailCleaningListTestData.expectedListInvalidEmails);
        });

        await test.step('Delete the contacts', async () => {
            await contactsStep.clickOnToggleAllCheckbox();
            await contactsStep.delateSelectedContactsFromAddressBook();
            await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
            await contactsStep.confirmDeleteContacts();
            await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
            await generalStep.closePopUpNotification();
        });

        await test.step('Delete the list', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            await prospectListsStep.cleanUpDeleteList(emailCleaningListTestData.invalidListName, "Delete List");
            await generalStep.expectModalIsShown(`Are you sure you want to delete "${emailCleaningListTestData.invalidListName}" list?`);
            await generalStep.expectPopUpNotificationIs("List deleted successfully.");
            await generalStep.closePopUpNotification();
        });
    });

    test('When the user adds to CRM the Catch-All emails, the emails are added to CRM', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const contactsStep = new ContactsStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('Search for the list', async () => {
            await generalStep.searchFor(emailCleaningListTestData.testListForSelectedEmails);
            await emailCleaningListStep.expectCorrespondingListsAreShown(emailCleaningListTestData.testListForSelectedEmails);
        });

        await test.step('Go to Add to CRM modal window', async () => {
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForSelectedEmails, 'Add to');
            await emailCleaningListStep.clickOnAddToCRMItem();
            await generalStep.expectModalIsShown('Add Contacts to CRM');
        });

        await test.step('Add the emails with Catch-All status to new list to CRM', async () => {
            await emailCleaningListStep.chooseContactsBasedOnStatusChechbox('Add Catch-All');
            await generalStep.createNewList(emailCleaningListTestData.catchAllListName);
            await generalStep.addList(emailCleaningListTestData.catchAllListName);//And selects the list from the dropdown
        });

        await test.step('Add the emails with Catch-All status to the CRM', async () => {
            await emailCleaningListStep.clickOnAddEmailsButton();
            await generalStep.expectPopUpNotificationIs('Contacts added successfully');
            await generalStep.closePopUpNotification();
            await generalStep.expectPageTitleIs('Email List Cleaning');
        });

        await test.step('Open Contacts page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.openList(emailCleaningListTestData.catchAllListName);
            await generalStep.expectPageTitleIs(emailCleaningListTestData.catchAllListName);
        });

        await test.step('The Catch-All emails are saved in Contacts', async () => {
            await contactsStep.expectCountOfItemIsPresented('email', emailCleaningListTestData.expectedListCatchAllEmails);
            await contactsStep.expectItemsAreInList('email', emailCleaningListTestData.expectedListCatchAllEmails);
        });

        await test.step('Delete the contacts', async () => {
            await contactsStep.clickOnToggleAllCheckbox();
            await contactsStep.delateSelectedContactsFromAddressBook();
            await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
            await contactsStep.confirmDeleteContacts();
            await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
            await generalStep.closePopUpNotification();
        });

        await test.step('Delete the list', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            await prospectListsStep.cleanUpDeleteList(emailCleaningListTestData.catchAllListName, "Delete List");
            await generalStep.expectModalIsShown(`Are you sure you want to delete "${emailCleaningListTestData.catchAllListName}" list?`);
            await generalStep.expectPopUpNotificationIs("List deleted successfully.");
            await generalStep.closePopUpNotification();
        });
    });

    test('When the user adds to CRM the Unknown emails, the emails are added to CRM', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const contactsStep = new ContactsStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Open Email Verification List Cleaning page', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'List Cleaning');
            await generalStep.expectCorrespondingUrl("/list-cleaning");
            await generalStep.expectPageTitleIs("Email List Cleaning");
        });

        await test.step('Search for the list', async () => {
            await generalStep.searchFor(emailCleaningListTestData.testListForSelectedEmails);
            await emailCleaningListStep.expectCorrespondingListsAreShown(emailCleaningListTestData.testListForSelectedEmails);
        });

        await test.step('Go to Add to CRM modal window', async () => {
            await emailCleaningListStep.clickOnMenu(emailCleaningListTestData.testListForSelectedEmails, 'Add to');
            await emailCleaningListStep.clickOnAddToCRMItem();
            await generalStep.expectModalIsShown('Add Contacts to CRM');
        });

        await test.step('Add the emails with Unknown status to new list to CRM', async () => {
            await emailCleaningListStep.chooseContactsBasedOnStatusChechbox('Add Unknown');
            await generalStep.createNewList(emailCleaningListTestData.unknownListName);
            await generalStep.addList(emailCleaningListTestData.unknownListName);//And selects the list from the dropdown
        });

        await test.step('Add the emails with Unknown status to the CRM', async () => {
            await emailCleaningListStep.clickOnAddEmailsButton();
            await generalStep.expectPopUpNotificationIs('Contacts added successfully');
            await generalStep.closePopUpNotification();
            await generalStep.expectPageTitleIs('Email List Cleaning');
        });

        await test.step('Open Contacts page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.openList(emailCleaningListTestData.unknownListName);
            await generalStep.expectPageTitleIs(emailCleaningListTestData.unknownListName);
        });

        await test.step('The Unknown emails are saved in Contacts', async () => {
            await contactsStep.expectCountOfItemIsPresented('email', emailCleaningListTestData.expectListUnknownEmails);
            await contactsStep.expectItemsAreInList('email', emailCleaningListTestData.expectListUnknownEmails);
        });

        await test.step('Delete the contacts', async () => {
            await contactsStep.clickOnToggleAllCheckbox();
            await contactsStep.delateSelectedContactsFromAddressBook();
            await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
            await contactsStep.confirmDeleteContacts();
            await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
            await generalStep.closePopUpNotification();
        });

        await test.step('Delete the list', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            await prospectListsStep.cleanUpDeleteList(emailCleaningListTestData.unknownListName, "Delete List");
            await generalStep.expectModalIsShown(`Are you sure you want to delete "${emailCleaningListTestData.unknownListName}" list?`);
            await generalStep.expectPopUpNotificationIs("List deleted successfully.");
            await generalStep.closePopUpNotification();
        });
    });

    test.skip('Clean Up test data', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Delete the contacts', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Contacts');
            await generalStep.expectPageTitleIs('Contacts');

            for (const email of emailCleaningListTestData.expectedEmailsListSortedByAscending) {
                await generalStep.checkTheChechbox(email);
            }
            await contactsStep.delateSelectedContactsFromAddressBook();
            await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
            await contactsStep.confirmDeleteContacts();
            await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
            await generalStep.closePopUpNotification();
        });

        await test.step('Delete the lists', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            for (const list of emailCleaningListTestData.listNames) {
                await prospectListsStep.cleanUpDeleteList(list, "Delete List");
                await generalStep.expectModalIsShown(`Are you sure you want to delete "${list}" list?`);
                await generalStep.expectPopUpNotificationIs("List deleted successfully.");
                await generalStep.closePopUpNotification();
            }
        });
    });
});