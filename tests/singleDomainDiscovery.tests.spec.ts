import { test, expect } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { SingleDomainDiscoveryStep } from '../src/steps/singleDomainDiscoveryStep';
import { EmailDiscoveryReportStep } from '../src/steps/emailDiscoveryReportStep';
import { ProspectListsStep } from '../src/steps/prospectListsStep';
import { ContactsStep } from '../src/steps/contactsStep';
import { contactsTestData } from '../src/helpers/TestConstants';

test.beforeAll(async ({ browser }) => {
  test.setTimeout(60000);

  const context = await browser.newContext();
  const page = await context.newPage();
  const generalStep = new GeneralStep(page);
  const contactsStep = new ContactsStep(page);
  const prospectListsStep = new ProspectListsStep(page);
  const loginStep = new LoginStep(page);

  await test.step('Navigate to the application', async () => {
    await generalStep.open();
    await loginStep.login(contactsTestData.username, contactsTestData.password);
    await generalStep.expectPageTitleIs("Dashboard");
  });

  await test.step('Open Contacts page', async () => {
    await generalStep.clickOnMainMenuButton('Prospects', 'Contacts');
    await generalStep.expectPageTitleIs("Contacts");
    await contactsStep.expectLoaderHidden();
  });

  await test.step('Delete the contacts', async () => {
    await generalStep.searchFor("thecatdoctor.co.uk");

    if (await contactsStep.theTableIsLoaded()) {
      const allContacts = await contactsStep.getAllItemsFromTable('email');

      if (allContacts.length > 0) {
        await contactsStep.clickOnToggleAllCheckbox();
        await contactsStep.delateSelectedContactsFromAddressBook();
        await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
        await contactsStep.confirmDeleteContacts();
        await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
        await generalStep.closePopUpNotification();
      }
    }

    await contactsStep.expectItemAreNotInList('email', ['thecatdoctor.co.uk']);
  });

  await test.step('Delete the list', async () => {
    await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
    await generalStep.expectPageTitleIs("Lists");
    const testLists = await prospectListsStep.getAllTestLists('List1');

    if (Array.isArray(testLists) && testLists.length !== 0) {
      await prospectListsStep.cleanUpDeleteList("List1", "Delete List");
      await generalStep.expectModalIsShown("Are you sure you want to delete \"List1\" list?");
      await generalStep.expectPopUpNotificationIs("List deleted successfully.");
      await generalStep.closePopUpNotification();
    }
  });

  await test.step('Delete the company from address book', async () => {
    await generalStep.clickOnMainMenuButton('Prospects', 'Companies');
    await generalStep.expectPageTitleIs("Companies");

    if (await contactsStep.theTableIsLoaded()) {
      await generalStep.searchFor("thecatdoctor.co.uk");
      const countRows = await contactsStep.getCoutnOfRows();

      if (countRows > 1) {
        await contactsStep.clickOnToggleAllCheckbox();
        await generalStep.clickOnButton('Delete');
        await generalStep.expectModalIsShown("Are you sure you want to delete selected companies from the address book?");
        await contactsStep.confirmDeleteContacts();
        await generalStep.expectPopUpNotificationIs("Companies have been deleted");
        await generalStep.closePopUpNotification();
        await contactsStep.expectItemAreNotInList('company', ["thecatdoctor.co.uk"]);
      }
    }

    await contactsStep.expectItemAreNotInList('email', ['thecatdoctor.co.uk']);
  });

  await context.close();
});

test.beforeEach(async ({ page }) => {
  const loginStep = new LoginStep(page);
  const generalStep = new GeneralStep(page);

  await generalStep.open();
  await loginStep.login(contactsTestData.username, contactsTestData.password);
  await generalStep.expectPageTitleIs("Dashboard");
});

test('Find Company, contacts and add to the list', async ({ page }) => {
  const generalStep = new GeneralStep(page);
  const singleDomainStep = new SingleDomainDiscoveryStep(page);
  const emailDiscoveryReportStep = new EmailDiscoveryReportStep(page);
  const prospectListsStep = new ProspectListsStep(page);
  const contactsStep = new ContactsStep(page);

  await test.step('Open Single Domain page', async () => {
    await generalStep.clickOnMainMenuButton('Domain Discovery', 'Single Domain');
    await generalStep.expectPageTitleIs("Find Email Addresses & Insights");
  });

  await test.step('Search for the domain', async () => {
    await singleDomainStep.searchDomain("https://thecatdoctor.co.uk/");
    await generalStep.expectPageTitleIs("Email Discovery Report");
    await emailDiscoveryReportStep.clickOnAddToListButton();
    await generalStep.expectModalIsShown("Save Company & Contacts");
  });

  await test.step('Create new list and add to CRM', async () => {
    await generalStep.createNewList("List1");
    await generalStep.addList("List1");//And selects the list from the dropdown
    await emailDiscoveryReportStep.expectListToBePresent("List1");
  });

  await test.step('Save the company to created list', async () => {
    await emailDiscoveryReportStep.clickOnSaveButton();
    await generalStep.expectPopUpNotificationIs("Company has been added");
    await generalStep.expectPageTitleIs("Email Discovery Report");
    await generalStep.closePopUpNotification();
  });

  await test.step('Open Contacts page', async () => {
    await generalStep.clickOnMainMenuButton('Prospects', 'Lists');
    await generalStep.expectPageTitleIs("Lists");
    await prospectListsStep.openList("List1");
    await generalStep.expectPageTitleIs("List1");
  });

  await test.step('The contacts are saved in a corresponding list', async () => {
    await generalStep.searchFor("thecatdoctor.co.uk");
    await contactsStep.expectItemsAreInList("email", ["thecatdoctor.co.uk"]);
  });
});

test.skip('Clean up', async ({ page }) => {
  test.setTimeout(60000);

  //const context = await browser.newContext();
  //const page = await context.newPage();
  const generalStep = new GeneralStep(page);
  const contactsStep = new ContactsStep(page);
  const prospectListsStep = new ProspectListsStep(page);
  const loginStep = new LoginStep(page);

  await test.step('Open the page and log in', async () => {
    await generalStep.open();
    await loginStep.login(contactsTestData.username, contactsTestData.password);
    await generalStep.expectPageTitleIs("Dashboard");
  });

  await test.step('Open Contacts page', async () => {
    await generalStep.clickOnMainMenuButton('Prospects', 'Contacts');
    await generalStep.expectPageTitleIs("Contacts");
    await contactsStep.expectLoaderHidden();
  });

  await test.step('Delete the contacts', async () => {
    await generalStep.searchFor("thecatdoctor.co.uk");

    if (await contactsStep.theTableIsLoaded()) {
      const countRows = await contactsStep.getCoutnOfRows();
      if (countRows > 1) {
        await contactsStep.clickOnToggleAllCheckbox();
        await generalStep.clickOnButton('Delete');
        await generalStep.expectModalIsShown("Are you sure you want to delete selected contacts from the address book?");
        await contactsStep.confirmDeleteContacts();
        await generalStep.expectPopUpNotificationIs("Contacts have been deleted");
        await generalStep.closePopUpNotification();
      }
    }
    else {
      console.log('No rows to show is visible');
      return;
    }

    await contactsStep.expectItemAreNotInList('email', ['thecatdoctor.co.uk']);
  });

  await test.step('Delete the list', async () => {
    await generalStep.clickOnMainMenuButton('Prospect', 'Lists');
    await generalStep.expectPageTitleIs("Lists");
    const testLists = await prospectListsStep.getAllTestLists('List1');

    if (Array.isArray(testLists) && testLists.length !== 0) {
      await prospectListsStep.cleanUpDeleteList("List1", "Delete List");
      await generalStep.expectModalIsShown("Are you sure you want to delete \"List1\" list?");
      await generalStep.expectPopUpNotificationIs("List deleted successfully.");
      await generalStep.closePopUpNotification();
      await generalStep.expectModalIsNotShown("Are you sure you want to delete \"List1\" list?");
      await page.mouse.click(50, 50);
    }
  });

  await test.step('Delete the company from address book', async () => {
    await generalStep.clickOnMainMenuButton('Prospects', 'Companies');
    await generalStep.expectPageTitleIs("Companies");
    await generalStep.searchFor("thecatdoctor.co.uk");
    const countRows = await contactsStep.getCoutnOfRows();

    if (countRows > 1) {
      await contactsStep.clickOnToggleAllCheckbox();
      await generalStep.clickOnButton('Delete');
      await generalStep.expectModalIsShown("Are you sure you want to delete selected companies from the address book?");
      await contactsStep.confirmDeleteContacts();
      await generalStep.expectPopUpNotificationIs("Companies have been deleted");
      await generalStep.closePopUpNotification();
      await contactsStep.expectItemAreNotInList('organization', ["thecatdoctor.co.uk"]);
    }
  });

  //await context.close();
});