import { test, expect } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { ContactsStep } from '../src/steps/contactsStep';
import { contactsTestData } from '../src/helpers/TestConstants';
import { ProspectListsStep } from '../src/steps/prospectListsStep';
import { EmailCleaningListStep } from '../src/steps/emailCleaningListStep';

test.setTimeout(80000);

test.describe.serial("The user can add companies/contacts and assign to companies/contacts", () => {

    test.beforeEach(async ({ page }) => {
        const loginStep = new LoginStep(page);
        const generalStep = new GeneralStep(page);

        await generalStep.open();
        await loginStep.login(contactsTestData.username, contactsTestData.password);
        await generalStep.expectPageTitleIs("Dashboard");
    });

    test('When the user deletes the contacts, lists and companies are deleted', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Open corresponding List page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
        });

        await test.step('Delete the test contacts from address book', async () => {
            const testLists = await prospectListsStep.getAllTestLists('Prospect');

            if (Array.isArray(testLists) && testLists.length !== 0) {
                await prospectListsStep.clickOnTheList('Prospect 1');
                await generalStep.expectPageTitleIs("Prospect 1");

                if (await contactsStep.theTableIsLoaded()) {
                    await contactsStep.expectLoaderHidden();
                    const countRows = await contactsStep.getCoutnOfRows();
                    if (countRows > 1) {
                        await contactsStep.clickOnToggleAllCheckbox();
                        await generalStep.clickOnButton('Delete');
                        await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
                        await contactsStep.confirmDeleteContacts();
                        await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
                        await generalStep.closePopUpNotification();
                        await contactsStep.expectItemAreNotInList('email', contactsTestData.contactsTestEmails);
                    }
                }
                else {
                    console.log('No rows to show is visible');
                    return;
                }
            }
            else {
                await prospectListsStep.clickOnTheList('Address Book');
                await generalStep.expectPageTitleIs("Contacts");

                if (await contactsStep.theTableIsLoaded()) {
                    const countRows = await contactsStep.getCoutnOfRows();

                    if (countRows > 1) {

                        for (const email of contactsTestData.contactsTestEmails) {
                            await generalStep.checkTheChechbox(email);
                        }
                        if (await generalStep.countCheckedCheckboxes() > 0) {
                            await generalStep.clickOnButton('Delete');
                            await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
                            await contactsStep.confirmDeleteContacts();
                            await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
                            await generalStep.closePopUpNotification();
                        }
                        await contactsStep.expectItemAreNotInList('email', contactsTestData.contactsTestEmails);
                    }
                }
            }
        });

        await test.step('Delete the lists', async () => {
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            const testLists = await prospectListsStep.getAllTestLists('Prospect');

            if (Array.isArray(testLists) && testLists.length !== 0) {
                for (const testList of testLists) {
                    await prospectListsStep.cleanUpDeleteList(testList, "Delete List");
                    await generalStep.expectModalIsShown(`Are you sure you want to delete "${testList}" list?`);
                    await generalStep.expectPopUpNotificationIs("List deleted successfully.");
                    await generalStep.closePopUpNotification();
                }
            }
            await prospectListsStep.expectListsAreNotPresented('Prospect');
        });

        await test.step('Delete the company from address book', async () => {
            await generalStep.clickOnSubMenuButton('Companies');
            await generalStep.expectPageTitleIs("Companies");

            if (await contactsStep.theTableIsLoaded()) {
                const countRows = await contactsStep.getCoutnOfRows();

                if (countRows > 1) {
                    for (const companyName of contactsTestData.companyNames) {
                        await generalStep.checkTheChechbox(companyName);
                    }
                    if (await generalStep.countCheckedCheckboxes() > 0) {
                        await generalStep.expectButtonIsVisible('Delete')
                        await generalStep.clickOnButton('Delete');
                        await generalStep.expectModalIsShown("Are you sure you want to delete selected companies from the address book?");
                        await contactsStep.confirmDeleteContacts();
                        await generalStep.expectPopUpNotificationIs("Companies have been deleted");
                        await generalStep.closePopUpNotification();
                    }
                    await contactsStep.expectItemAreNotInList('organization', contactsTestData.companyNames);
                }
            }
            else {
                expect(await contactsStep.getCoutnOfRows()).toBe(1);
            }
        });
    });

    test('When the user adds the companies, then the companies are shown on Companies page', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Companies');
            await generalStep.expectPageTitleIs("Companies");
        });

        await test.step('When a user adds companies with valid data, companies are shown on Companies table', async () => {
            const domains = contactsTestData.domains;
            const companyNames = contactsTestData.companyNames;

            //create some company with test data
            for (let i = 0; i < domains.length; i++) {
                await generalStep.clickOnButton('Add Company');
                if (i === 0) {
                    await contactsStep.fillInTheInputField('Description', contactsTestData.longDiscription);
                };
                await contactsStep.fillInTheInputField('Domain', domains[i]);
                await contactsStep.fillInTheInputField('Company Name', companyNames[i]);
                await generalStep.clickOnButton('Create Company');
                await generalStep.expectDrawerIsNotShown('Add Company');
                await generalStep.expectPopUpNotificationIs('Company has been created successfully');
                await generalStep.closePopUpNotification();
                await generalStep.expectPageTitleIs('Companies');
            }

            await contactsStep.expectItemsAreInList('organization', companyNames);
        });

        await test.step('When a user tries to add a company without completing the required fields, an error message appears', async () => {
            await generalStep.clickOnButton('Add Company');
            await generalStep.expectDrawerIsShown('Add Company');
            await generalStep.clickOnButton('Create Company');
            await contactsStep.expectErrorIsPresented('Domain', 'This field is required');
            await contactsStep.expectErrorIsPresented('Company Name', 'This field is required');
            await page.keyboard.press('Escape');
        });

        await test.step('When a user adds companies with invalid data, then validetion error message is received', async () => {
            const domains = contactsTestData.invalidDomains;
            const companyNames = contactsTestData.invalidCompanyNames;

            await generalStep.clickOnButton('Add Company');

            for (let i = 0; i < domains.length; i++) {
                await contactsStep.fillInTheInputField('Domain', domains[i]);
                await contactsStep.fillInTheInputField('Company Name', companyNames[i]);
                await generalStep.clickOnButton('Create Company');
                await contactsStep.expectErrorIsPresented('Domain', 'Invalid domain');
                await contactsStep.expectErrorIsPresented('Company Name');
                await contactsStep.clearInputField('Domain');
                await contactsStep.clearInputField('Company Name');
            }

            await page.keyboard.press('Escape');
            await generalStep.expectPageTitleIs('Companies');
        });

        await test.step('When the user adds already existing company, then validetion error message is received', async () => {
            await generalStep.clickOnButton('Add Company');
            await generalStep.expectDrawerIsShown('Add Company');
            await contactsStep.fillInTheInputField('Domain', 'www.halian.com');
            await contactsStep.fillInTheInputField('Company Name', 'Halian');
            await generalStep.clickOnButton('Create Company');
            await generalStep.expectPopUpNotificationIs('Company with this domain already exists');
            await generalStep.closePopUpNotification();
            await page.keyboard.press('Escape');
            await generalStep.expectDrawerIsNotShown('Add Company');
            await generalStep.expectPageTitleIs('Companies');
        });
    });

    test('When the user bulk adds the contacts the contacts are shown on Contacts page', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);
        const prospectListsStep = new ProspectListsStep(page);
        const emailCleaningListStep = new EmailCleaningListStep(page);
        const filePath = './listCleaningEmails.csv';

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
        });

        //Create the list
        await test.step('When the user creates New Lists, the new lists are created', async () => {
            await prospectListsStep.createList('Prospect ', 1);
            await generalStep.expectPopUpNotificationIs('List has been created');
            await generalStep.closePopUpNotification();
            await generalStep.expectPageTitleIs('Lists');
        });

        //Upload the file of contacts
        await test.step('Upload the file of contacts', async () => {
            const fileName = filePath.split('/').pop();
            await generalStep.clickOnSubMenuButton('Contacts');
            await generalStep.expectPageTitleIs('Contacts');
            await contactsStep.clickOnUploadContactsButton();
            await contactsStep.clickOnMenuItemImportContacts();
            await generalStep.expectModalIsShown('Upload Contacts');
            await generalStep.uploadFile(filePath);
            await generalStep.expectFileIsUploaded(`${fileName}`);
            await generalStep.addList('Prospect 1');
            //await contactsStep.clickOnSelectListDropDown();
            //await contactsStep.selectItemFromDropdown('Prospect 1');

            await generalStep.clickOnButton('Next Step');
            await generalStep.expectModalIsShown('Column Matching');
            await emailCleaningListStep.expectRecognizedEmailsIsShown(filePath)//todo the reader of file in generalStep doesn't work
            //await generalStep.expectRecognizedEmailsIsShown(filePath);
            await generalStep.clickOnButton('Upload');
            await generalStep.expectModalIsShown('Contact Import Statistics');
            await generalStep.clickOnButton('Close');
            await generalStep.expectPageTitleIs('Contacts');
        });
    });

    test('When the user adds the contacts, then the contacts are shown on Contacts page', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
        });

        await test.step('When the user adds contact, the item is displayed in the Contacts table', async () => {
            await prospectListsStep.clickOnTheList('Prospect 1');
            await generalStep.expectPageTitleIs("Prospect 1");
            await contactsStep.clickOnAddContactButton();
            await contactsStep.fillInTheInputField('First name', 'Alan');
            await contactsStep.fillInTheInputField('Last name', 'Ross');
            await contactsStep.fillInTheInputField('Email', 'alan.ross@h2scan.com');
            await contactsStep.fillInTheInputField('Phone', '12345678');
            await contactsStep.fillInTheInputField('Job Title', 'QA');
            await contactsStep.openCompaniesDropdownAddContactDrawer();
            await contactsStep.selectItemFromDropdown('T1');
            await contactsStep.clickOnCreateContactButton();
            await generalStep.expectPopUpNotificationIs('Contact has been created successfully');
            await generalStep.closePopUpNotification();
            await generalStep.expectPageTitleIs("Prospect 1");
            await generalStep.searchFor('alan.ross@h2scan.com');
            await contactsStep.expectItemsAreInList('email', ['alan.ross@h2scan.com']);
        });

        await test.step('When the user adds contact with already existing email address, then validation error message is received', async () => {
            await contactsStep.clickOnAddContactButton();
            await contactsStep.fillInTheInputField('Last name', 'Ro1');
            await contactsStep.fillInTheInputField('Email', 'alan.ross@h2scan.com');
            await contactsStep.clickOnCreateContactButton();
            await generalStep.expectPopUpNotificationIs('Contact already exists');
            await generalStep.closePopUpNotification();
            await generalStep.expectPageTitleIs("Prospect 1");
            await generalStep.expectItemsAreInTheList('email', 'alan.ross@h2scan.com');
            await page.keyboard.press('Escape');
            await generalStep.expectPageTitleIs("Prospect 1");
        });

        await test.step('When the user adds contact without filling required fields, the validation error message is received', async () => {
            await contactsStep.clickOnAddContactButton();
            await contactsStep.clickOnCreateContactButton();
            await contactsStep.expectErrorIsPresented('Email', 'This field is required');
            await page.keyboard.press('Escape');
            await generalStep.expectPageTitleIs("Prospect 1");
        });

        await test.step('When the user adds contact with invalid data, the validation error message is received', async () => {
            await contactsStep.clickOnAddContactButton();
            await contactsStep.fillInTheInputField('First name', '!@#$%^&*()<>?:"{}|_+');
            await contactsStep.fillInTheInputField('Last name', '!@#$%^&*()<>?:"{}|_+');
            await contactsStep.fillInTheInputField('Email', '.alan.rossh2scan.com');
            await contactsStep.fillInTheInputField('Phone', '!@Qw12345678');
            await contactsStep.fillInTheInputField('Job Title', '!@#$%^&*()<>?:"{}|_+');
            await contactsStep.clickOnCreateContactButton();
            await contactsStep.expectErrorIsPresented('Email', 'Incorrect email format');
            await contactsStep.expectErrorIsPresented('Phone', 'Invalid phone number');
            await contactsStep.expectErrorIsPresented('First name', 'Invalid value');
            await contactsStep.expectErrorIsPresented('Last name', 'Invalid value');
            await page.keyboard.press('Escape');
            await generalStep.expectPageTitleIs("Prospect 1");
        });
    });

    test('When the user assigns the company to the new contact, the contact is created and assigned to the company', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Companies');
            await generalStep.expectPageTitleIs("Companies");
        });

        await test.step('When the user assigns the company to new contacts with valid data, the contact is created and company is assigned to this contacts', async () => {
            await contactsStep.clickOnTheCorrespondingRowTable('organization', 'Halian.com');
            await generalStep.expectDrawerIsShown();
            await generalStep.clickOnButton('New Contact');
            await generalStep.expectModalIsShown('Add Contact to Halian.com');
            await generalStep.addList('Prospect 1');
            await contactsStep.fillInTheInputField('First name', 'Kirstine');
            await contactsStep.fillInTheInputField('Last name', 'Donat');
            await contactsStep.fillInTheInputField('Email', 'kirstine@qa-financial.com');
            await contactsStep.fillInTheInputField('Job Title', 'QA');
            await generalStep.clickOnButton('Save');
            await generalStep.expectPopUpNotificationIs('Contact has been created successfully');
            await generalStep.closePopUpNotification();
            await contactsStep.expectContactsIsInTheListOnDrawer('kirstine@qa-financial.com');
            await page.keyboard.press('Escape');//close the drawer
            await generalStep.expectPageTitleIs('Companies');
        });

        await test.step('When the user assign the company and tries to create already existing contacts, the error message is received', async () => {
            await contactsStep.clickOnTheCorrespondingRowTable('organization', 'Halian.com');
            await generalStep.expectDrawerIsShown();
            await generalStep.clickOnButton('Add Contact');
            await contactsStep.selectNewContactDropdownItem();
            await generalStep.expectModalIsShown('Add Contact to Halian.com');
            await contactsStep.fillInTheInputField('Email', 'kirstine@qa-financial.com');
            await generalStep.clickOnButton('Save');
            await generalStep.expectPopUpNotificationIs('Contact with this email already exists');
            await generalStep.closePopUpNotification();
            await page.keyboard.press('Escape');//close the drawer
            await page.mouse.click(100, 200);
            await generalStep.expectPageTitleIs('Companies');
        });

        await test.step('When the user assigns new contact without filling required fields, the validation error message is received', async () => {
            await contactsStep.clickOnTheCorrespondingRowTable('organization', contactsTestData.companyNames[1]);
            await generalStep.expectDrawerIsShown();
            await generalStep.clickOnButton('Add Contact');
            await contactsStep.selectNewContactDropdownItem();
            await generalStep.expectModalIsShown(`Add Contact to ${contactsTestData.companyNames[1]}`);
            await generalStep.clickOnButton('Save');
            await contactsStep.expectErrorIsPresented('Email', 'This field is required');
            await generalStep.clickOnButton('Cancel');
            await page.keyboard.press('Escape');//close the drawer
            await generalStep.expectPageTitleIs('Companies');
        });

        await test.step('When the user assigns new contact with invalid data, the validation error message is received', async () => {
            await contactsStep.clickOnTheCorrespondingRowTable('organization', contactsTestData.companyNames[2]);
            await generalStep.expectDrawerIsShown();
            await generalStep.clickOnButton('Add Contact');
            await contactsStep.selectNewContactDropdownItem();
            await generalStep.expectModalIsShown(`Add Contact to ${contactsTestData.companyNames[2]}`);
            await contactsStep.fillInTheInputField('First name', '!@#$%^&*()<>?:"{}|_+');
            await contactsStep.fillInTheInputField('Last name', '!@#$%^&*()<>?:"{}|_+');
            await contactsStep.fillInTheInputField('Email', '.alan.rossh2scan.com');
            await contactsStep.fillInTheInputField('Phone', '!@Qw12345678');
            await contactsStep.fillInTheInputField('Job Title', '!@#$%^&*()<>?:"{}|_+');
            await generalStep.clickOnButton('Save');
            await contactsStep.expectErrorIsPresented('Email', 'Incorrect email format');
            await contactsStep.expectErrorIsPresented('Phone', 'Invalid phone number');
            await contactsStep.expectErrorIsPresented('First name', 'Invalid value');
            await contactsStep.expectErrorIsPresented('Last name', 'Invalid value');
            await page.keyboard.press('Escape');
            await generalStep.expectPageTitleIs('Companies');
        });
    });

    test('When the user assigns contacts to the company the contacts are assigned to the company', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Contacts');
            await generalStep.expectPageTitleIs("Contacts");
        });

        await test.step('When the user assigns the contact to the company, the contact is assigned to the company', async () => {
            await contactsStep.clickOnTheCorrespondingRowTable('email', 'zak@duck.com');
            await generalStep.expectDrawerIsShown();
            await generalStep.clickOnButton('Assign Company');
            await contactsStep.selectItemFromContactsDropdown('Halian.com');
            await generalStep.expectPopUpNotificationIs('Company has been successfully assigned');
            await generalStep.closePopUpNotification();
            await generalStep.expectButtonIsVisible('Halian.com');//check the company is assigned
            await page.keyboard.press('Escape');//close the drawer
            await generalStep.expectPageTitleIs('Contacts');
            await generalStep.expectItemByEmail('zak@duck.com', 'companyName', 'Halian.com');
        });

        await test.step('When a user assigns a contact to the another company, the contact is assigned to the another company', async () => {
            await contactsStep.clickOnTheCorrespondingRowTable('email', 'zak@duck.com');
            await generalStep.expectDrawerIsShown();
            await generalStep.clickOnButton('Halian.com');
            await contactsStep.selectItemFromContactsDropdown('T1');
            await generalStep.expectPopUpNotificationIs('Company has been successfully assigned');
            await generalStep.closePopUpNotification();
            await generalStep.expectButtonIsVisible('T1');//check the company is assigned
            await page.keyboard.press('Escape');//close the drawer
            await generalStep.expectPageTitleIs('Contacts');
            await generalStep.expectItemByEmail('zak@duck.com', 'companyName', 'T1');
        });
    });

    test('When the user assigns the company to the contacts, the company is assigned to the contacts', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Companies');
            await generalStep.expectPageTitleIs("Companies");
        });

        await test.step('When the user assigns the company to the contacts, the company is assigned to the contacts', async () => {
            await contactsStep.clickOnTheCorrespondingRowTable('organization', 'Halian.com');
            await generalStep.expectDrawerIsShown();
            await generalStep.clickOnButton('Add Contact');
            await contactsStep.fillInMenuSearchInput('zo');
            await contactsStep.expectItemsAreInDropdown('zo');
            await contactsStep.selectItemFromContactsDropdown('zoodonate_bg@zooplus.com');
            await generalStep.expectPopUpNotificationIs('Contact has been added successfully');
            await generalStep.closePopUpNotification();
            await contactsStep.expectContactsIsInTheListOnDrawer('zoodonate_bg@zooplus.com');
        });

        await test.step('And the user tries to assign to same contacts, there is no this contact among the dropdown items', async () => {
            await generalStep.expectDrawerIsShown();
            await generalStep.clickOnButton('Add Contact');
            await contactsStep.fillInMenuSearchInput('zo');
            await contactsStep.expectItemIsNotInDropdown('zoodonate_bg@zooplus.com');
            await page.keyboard.press('Escape');        //close the drawer
            await generalStep.expectPageTitleIs('Companies');
        });
    });

    test('When the user assigns already assigned contact, the extra clarifying question is shown', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Companies');
            await generalStep.expectPageTitleIs("Companies");
        });

        await test.step('When the user assigns already assigned contact', async () => {
            await contactsStep.clickOnTheCorrespondingRowTable('organization', 'T1');
            await generalStep.expectDrawerIsShown();
            await generalStep.clickOnButton('Add Contact');
            await contactsStep.fillInMenuSearchInput('zoodonate_bg@zooplus.com');
            await contactsStep.selectItemFromContactsDropdown('zoodonate_bg@zooplus.com');
            await generalStep.expectModalIsShown('This contact is assigned to company "www.halian.com". Are you sure you want to move it to "T1"?');
            await generalStep.clickOnButton('Save');
        });

        await test.step('The extra clarifying question is shown', async () => {
            await generalStep.expectPopUpNotificationIs('Contact has been added successfully');
            await generalStep.closePopUpNotification();
            await contactsStep.expectContactsIsInTheListOnDrawer('zoodonate_bg@zooplus.com');
            await page.keyboard.press('Escape');//close the drawer
            await generalStep.expectPageTitleIs('Companies');
        });
    });

    test('When the user exports selected companies on the Companies page the companies are downloaded', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);
        const downloadPath = './downloads/downloadCompanies.csv';

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Companies');
            await generalStep.expectPageTitleIs("Companies");
            await contactsStep.expectLoaderHidden();
            await contactsStep.expectItemsAreInList('organization', contactsTestData.companyNames);
        });

        await test.step('When the user exports selected companies on the Companies page, the companies are downloaded', async () => {
            await generalStep.checkTheChechbox(contactsTestData.companyNames[1]);
            await generalStep.checkTheChechbox(contactsTestData.companyNames[2]);
            expect(await generalStep.countCheckedCheckboxes()).toBe(2);
            await generalStep.saveDownloadedFile(downloadPath, 'Export');
            await generalStep.selectedEmailsAreDownloaded(downloadPath, 'Company', [contactsTestData.companyNames[1], contactsTestData.companyNames[2]]);
            await generalStep.deleteTheDownloadedFile(downloadPath);
        });
    });

    test('When the user exports selected contacts on the Contacts page the contacts are downloaded', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Contacts');
            await generalStep.expectPageTitleIs("Contacts");
            await contactsStep.expectLoaderHidden();
            await contactsStep.expectItemsAreInList('email', contactsTestData.contactsTestEmails);
        });

        await test.step('When the user exports selected contacts on the Contacts page the contacts are downloaded', async () => {
            const downloadPath = './downloads/downloadContacts.csv';
            await generalStep.checkTheChechbox("dl-affiliates@justanswer.com");
            await generalStep.checkTheChechbox("zoodonate_bg@zooplus.com");
            expect(await generalStep.countCheckedCheckboxes()).toBe(2);
            await generalStep.saveDownloadedFile(downloadPath, 'Export');
            await generalStep.selectedEmailsAreDownloaded(downloadPath, 'Email', ["dl-affiliates@justanswer.com", "zoodonate_bg@zooplus.com"]);
            await generalStep.deleteTheDownloadedFile(downloadPath);
        });
    });

    test('When the user copies, moves, removes the contacts to corresponding list, the contacts are copied, moved, removed', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);
        const prospectListsStep = new ProspectListsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
        });

        await test.step('When the user moves to list corresponding contacts', async () => {
            await prospectListsStep.clickOnTheList('Prospect 1');
            await generalStep.expectPageTitleIs("Prospect 1");
            await contactsStep.expectItemsAreInList('email', ["321.qwerty@sciplay.com"]);
            await generalStep.checkTheChechbox("321.qwerty@sciplay.com");
            expect(await generalStep.countCheckedCheckboxes()).toBe(1);
            await generalStep.clickActionButton('Move to Another List');
            await generalStep.expectModalIsShown('Move to Another List');
            await generalStep.addList('Default');
            await generalStep.clickOnButton('Move');
            await generalStep.expectPopUpNotificationIs('Contacts moved successfully');
            await generalStep.closePopUpNotification();
        });

        await test.step('Then the contacts are moved to the selected list', async () => {
            await generalStep.expectPageTitleIs("Prospect 1");
            await contactsStep.expectItemAreNotInList('email', ["321.qwerty@sciplay.com"]);//contact is not in the old list 
            await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.clickOnTheList('Default');
            await generalStep.expectPageTitleIs("Default");
            await contactsStep.expectItemsAreInList('email', ["321.qwerty@sciplay.com"]);//contact is in the new list 
        });

        await test.step('When the user copies corresponding contacts to the selected list', async () => {
            await generalStep.checkTheChechbox("321.qwerty@sciplay.com");
            await generalStep.clickActionButton('Copy to List');
            await generalStep.expectModalIsShown('Copy to List');
            await generalStep.addList('Prospect 1');
            await generalStep.clickOnButton('Copy');
            await generalStep.expectPopUpNotificationIs('Contacts copied to lists successfully');
            await generalStep.closePopUpNotification();
        });

        await test.step('Then contacts are copied to the selected list', async () => {
            await generalStep.expectPageTitleIs("Default");
            await contactsStep.expectItemsAreInList('email', ["321.qwerty@sciplay.com"]);//contact is still in the old list 
            await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
            await generalStep.expectPageTitleIs("Lists");
            await prospectListsStep.clickOnTheList('Default');
            await generalStep.expectPageTitleIs("Default");
            await contactsStep.expectItemsAreInList('email', ["321.qwerty@sciplay.com"]);//contact is in the new list 
        });

        await test.step('When the user removes from list corresponding contacts', async () => {
            await generalStep.checkTheChechbox("321.qwerty@sciplay.com");
            await generalStep.clickActionButton('Remove from List');
            await generalStep.expectModalIsShown('Remove from List');
            await generalStep.addList('Default');
            await generalStep.clickOnButton('Remove');
            await generalStep.expectPopUpNotificationIs('Contacts removed from lists successfully');
            await generalStep.closePopUpNotification();
        });

        await test.step('Then the contacts are removed from the selected list', async () => {
            await generalStep.expectPageTitleIs("Default");
            await contactsStep.expectItemAreNotInList('email', ["321.qwerty@sciplay.com"]);//the contact is not in the list 
            await generalStep.clickOnMainMenuButton('Prospect', 'Contacts');
            await generalStep.expectPageTitleIs("Contacts");
            await contactsStep.expectItemsAreInList('email', ["321.qwerty@sciplay.com"]);//the contact is in the Contacts 
        });
    });

    test('When the user verifies the emails, the verified emails are shown', async ({ page }) => {
        //todo Now doesn't work
    });

    test('When the user deletes the corresponding company from Companies page, the company is deleted', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const contactsStep = new ContactsStep(page);

        await test.step('Open Lists page', async () => {
            await generalStep.clickOnMainMenuButton('Prospects', 'Companies');
            await generalStep.expectPageTitleIs("Companies");
        });

        await test.step('When the user delete the company without contacts', async () => {
            if (await contactsStep.theTableIsLoaded()) {
                await generalStep.checkTheChechbox(contactsTestData.companyNames[0]);

                if (await generalStep.countCheckedCheckboxes() > 0) {
                    await generalStep.clickOnButton('Delete');
                    await generalStep.expectModalIsShown('Are you sure you want to delete selected companies from the address book?');
                    await generalStep.clickOnButton('Delete');
                    await generalStep.expectPopUpNotificationIs('Companies have been deleted');
                    await generalStep.closePopUpNotification();
                }
            }
            else {
                expect(await contactsStep.getCoutnOfRows()).toBe(1);//the table is empty only /the header is shown
            }
        });

        await test.step('Then the company are not shown on Companies page', async () => {
            await generalStep.expectPageTitleIs("Companies");
            await contactsStep.expectItemAreNotInList('company', [contactsTestData.companyNames[0]]);//contact is in the Companies 
        });

        await test.step('When the user delete the company with contacts', async () => {
            //todo Now work the same as the company without contacts
        });
    });
});