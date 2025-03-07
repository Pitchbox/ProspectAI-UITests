import { test } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { logInData, outreachTestData } from '../src/helpers/TestConstants';
import { OutreacheStep } from '../src/steps/outreachStep';

test.beforeAll(async ({ browser }) => {
    test.setTimeout(100000);

    const context = await browser.newContext();
    const page = await context.newPage();
    const generalStep = new GeneralStep(page);
    const outreachStep = new OutreacheStep(page);
    const loginStep = new LoginStep(page);

    await test.step('Navigate to the application', async () => {
        await generalStep.open();
        await loginStep.login(logInData.username, logInData.password);
        await generalStep.expectPageTitleIs("Dashboard");
    });

    await test.step('Open Email Account page', async () => {
        await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
        await outreachStep.expectPageTitleIs("Email Accounts");
        await outreachStep.expectEmailAccountIsPresented('email', ['prospectaiautotests@gmail.com']);

    });

    await test.step('When the user deletes the test email accounts', async () => {
        const massOfEmailAccounts = [outreachTestData.ImapSmtpAccount, outreachTestData.ImapSmtpAccount1];
        const emails = await outreachStep.getAllEmailAccount();

        for (const emailAccount of massOfEmailAccounts) {

            if (emails && emails.includes(emailAccount)) {
                await outreachStep.clickOnMenuActions(emailAccount);
                await outreachStep.selectActionFromMenu('Delete');
                await generalStep.expectModalIsShown(`Are you sure you want to delete email account ${emailAccount}?`);
                await generalStep.clickOnButton('Delete');
                await generalStep.expectPopUpNotificationIs('Email account has deleted');
                await generalStep.closePopUpNotification();
                await generalStep.expectModalIsNotShown(`Are you sure you want to delete email account ${emailAccount}?`);
            }
        }

        await outreachStep.expectEmailAccountIsNotPresented('email', massOfEmailAccounts);
    });

    await test.step('Then the Deleted item is not shown on Email Accounts table', async () => {
        await outreachStep.expectPageTitleIs("Email Accounts");
        await outreachStep.expectEmailAccountIsNotPresented('email', [outreachTestData.ImapSmtpAccount, outreachTestData.ImapSmtpAccount1]);
    });

    await context.close();
});

test.beforeEach(async ({ page }) => {
    const loginStep = new LoginStep(page);
    const generalStep = new GeneralStep(page);

    await generalStep.open();
    await loginStep.login(logInData.username, logInData.password);
    await generalStep.expectPageTitleIs("Dashboard");
});

test.describe.serial('When the user clicks on the Outreach button, the "\Email Accounts"\ and "\Inbox Placement"\ items are shown', () => {

    test.describe('When the user connects Google and Microsoft 365 email account, the emails accounts are shown on Email Accounts page', () => {

        test('When the user connects Google email account, the Google email account is shown on Email Account page', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const outreachStep = new OutreacheStep(page);

            await test.step('Open Email Account page', async () => {
                await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
                await outreachStep.expectPageTitleIs("Email Accounts");
            });

            await test.step('When the user connects Google email account', async () => {
                await generalStep.clickOnButton('Connect Account');
                await generalStep.expectModalIsShown('Add Email Account');
                await outreachStep.selectEmailItem('Sign in with Google');
                await generalStep.expectCorrespondingUrl('//accounts.google.com/**');
            });

            await test.step('Then the Google email account is shown on Email Account page', async () => {
                //todo mock connection to Google email account
                await generalStep.goBackInBrowser();
                await outreachStep.expectPageTitleIs("Email Accounts");
                await outreachStep.expectTableHeaderArePresented(['Email Address', 'From Name', 'Email Provider', 'MX Score', 'Status']);
                await outreachStep.expectEmailAccountIsPresented('email', [logInData.username]);
            });
        });

        test('When the user connects Microsoft 365 email account, the Microsoft 365 email account is shown on Email Account page', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const outreachStep = new OutreacheStep(page);

            await test.step('Open Email Account page', async () => {
                await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
                await outreachStep.expectPageTitleIs("Email Accounts");
            });

            await test.step('When the user connects Microsoft 365 email account', async () => {
                await generalStep.clickOnButton('Connect Account');
                await generalStep.expectModalIsShown('Add Email Account');
                await outreachStep.selectEmailItem('Microsoft 365');
                await page.waitForTimeout(5000);
                await generalStep.expectCorrespondingUrl('//login.microsoftonline.com/**');
            });

            await test.step('Then the Microsoft 365 email account is shown on Email Account page', async () => {
                //todo mock connection to Microsoft 365 email account
                await generalStep.goBackInBrowser();
                await outreachStep.expectPageTitleIs("Email Accounts");
                await outreachStep.expectTableHeaderArePresented(['Email Address', 'From Name', 'Email Provider', 'MX Score', 'Status']);
                await outreachStep.expectEmailAccountIsPresented('email', [outreachTestData.MicrosoftOutlookAccount]);
            });
        });
    });

    test.describe('When the user connects Imap Smtp email accounts, the emails accounts are shown on Email Accounts page', () => {

        test('When the user connects Imap/Smtp email account with Auto Discovery, the email account is the email account is connected', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const outreachStep = new OutreacheStep(page);

            await test.step('Open Email Account page', async () => {
                await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
                await outreachStep.expectPageTitleIs("Email Accounts");
            });

            await test.step('When the user connects Imap/Smtp email account with Auto Discovery', async () => {
                await generalStep.clickOnButton('Connect Account');
                await generalStep.expectModalIsShown('Add Email Account');
                await outreachStep.selectEmailItem('Other (IMAP / SMTP)');
                await generalStep.expectModalIsShown('Add Email Account - IMAP / SMTP');
                await generalStep.expectTheButtonIsDisabled('Auto Discover');
                await outreachStep.fillInputFieldByLabel('From Name', outreachTestData.ImapSmtpAccount);
                await outreachStep.fillInputFieldByLabel('Email Address', outreachTestData.ImapSmtpAccount);
                await outreachStep.fillInputFieldByLabel('Password', outreachTestData.ImapSmtpPassword);
                await generalStep.clickOnButton('Auto Discover');
            });

            await test.step('Then the Imap/Smtp email account is shown on Email Account page', async () => {
                await generalStep.expectButtonIsNotVisible('Auto Discover');
                await outreachStep.expectPageTitleIs("Email Accounts");
                await generalStep.expectPopUpNotificationIs('Email account has been created');
                await generalStep.closePopUpNotification();
                await outreachStep.expectEmailAccountIsPresented('email', [outreachTestData.ImapSmtpAccount]);
            });
        });

        test('When the user connects already existing Imap/Smtp email account with Auto Discovery, the email account is the email account is connected', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const outreachStep = new OutreacheStep(page);

            await test.step('Open Email Account page', async () => {
                await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
                await outreachStep.expectPageTitleIs("Email Accounts");
            });

            await test.step('When the user connects Imap/Smtp email account with Auto Discovery', async () => {
                await generalStep.clickOnButton('Connect Account');
                await generalStep.expectModalIsShown('Add Email Account');
                await outreachStep.selectEmailItem('Other (IMAP / SMTP)');
                await generalStep.expectModalIsShown('Add Email Account - IMAP / SMTP');
                await generalStep.expectTheButtonIsDisabled('Auto Discover');
                await outreachStep.fillInputFieldByLabel('From Name', outreachTestData.ImapSmtpAccount);
                await outreachStep.fillInputFieldByLabel('Email Address', outreachTestData.ImapSmtpAccount);
                await outreachStep.fillInputFieldByLabel('Password', outreachTestData.ImapSmtpPassword);
                await generalStep.expectTheButtonIsEnabled('Auto Discover');
                await generalStep.clickOnButton('Auto Discover');
            });

            await test.step('Then the Imap/Smtp email account is shown on Email Account page', async () => {
                await generalStep.expectButtonIsNotVisible('Auto Discover');
                await generalStep.expectPopUpNotificationIs('This email address is already associated with another account. Please contact support team');
                await generalStep.closePopUpNotification();
                await generalStep.expectModalIsShown('Add Email Account - IMAP / SMTP');
            });
        });

        test.skip('When the user connects Imap/Smtp email account Advinced, the email account is connected', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const outreachStep = new OutreacheStep(page);

            await test.step('Open Email Account page', async () => {
                await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
                await outreachStep.expectPageTitleIs("Email Accounts");
            });

            await test.step('When the user connects Imap/Smtp email account Advinced', async () => {
                await generalStep.clickOnButton('Connect Account');
                await generalStep.expectModalIsShown('Add Email Account');
                await outreachStep.selectEmailItem('Other (IMAP / SMTP)');
                await generalStep.expectModalIsShown('Add Email Account - IMAP / SMTP');
                await generalStep.clickOnButton('Advanced');
                await generalStep.expectModalIsShown('Add Email Account - IMAP / SMTP');
                await generalStep.expectTheButtonIsDisabled('Save');
                await outreachStep.fillInputFieldByLabel('From Name', outreachTestData.ImapSmtpAccount1);
                await outreachStep.fillInputFieldByLabel('Email Address', outreachTestData.ImapSmtpAccount1);
                await outreachStep.fillInputFieldByLabel('IMAP Server', outreachTestData.ImapSmtpServer);
                await outreachStep.fillInputField('Port', '993', 0);
                await outreachStep.fillInputField('Username', outreachTestData.ImapSmtpAccount1, 0);
                await outreachStep.fillInputField('Password', outreachTestData.ImapSmtpPassword1, 0);
                await outreachStep.fillInputFieldByLabel('SMTP Server', outreachTestData.ImapSmtpServer);
                await outreachStep.fillInputField('Username', outreachTestData.ImapSmtpAccount1, 1);
                await outreachStep.fillInputField('Password', outreachTestData.ImapSmtpPassword1, 1);
                await outreachStep.fillInputField('Port', '25', 1);
                await outreachStep.clickOnFieldByLabel('SSL/TLSSSL', 1);
                await outreachStep.selectSSL_TLSDropdownItem('None');
                await generalStep.expectTheButtonIsEnabled('Save');
                await generalStep.clickOnButton('Save');
            });

            await test.step('Then the Imap/Smtp email account is shown on Email Account page', async () => {
                await generalStep.expectButtonIsVisible('Save')
                await outreachStep.expectPageTitleIs("Email Accounts");
                await generalStep.expectModalIsNotShown('Add Email Account - IMAP / SMTP');
                await generalStep.expectPopUpNotificationIs('Email account has been created');
                await generalStep.closePopUpNotification();
                await outreachStep.expectEmailAccountIsPresented('email', [outreachTestData.ImapSmtpAccount1]);
            });
        });
    });
});

test.describe('When the user clicks on the Three Dods Menu and selects the appropriate action, the action is performed', () => {
    test('When the user clicks on the Three Dods Menu and selects the Edit action, the action is performed', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const outreachStep = new OutreacheStep(page);

        await test.step('Open Email Account page', async () => {
            await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
            await outreachStep.expectPageTitleIs("Email Accounts");
        });

        await test.step('When the user edits the From Name field', async () => {
            await outreachStep.clickOnMenuActions(outreachTestData.MicrosoftOutlookAccount);
            await outreachStep.selectActionFromMenu('Edit');
            await generalStep.expectModalIsShown('Edit Email Account');
            await outreachStep.fillInputFieldByLabel('From Name', 'OutLookAccount');
            await generalStep.clickOnButton('Save');
        });

        await test.step('Then the updated From Name field is shown on Email Accounts table', async () => {
            await generalStep.expectModalIsNotShown('Edit Email Account');
            await generalStep.expectPopUpNotificationIs('Email account has been updated');
            await generalStep.closePopUpNotification();
            await outreachStep.expectPageTitleIs("Email Accounts");
            await outreachStep.expectEmailAccountIsPresented('from-name', ['OutLookAccount']);
        });
    });

    test('When the user clicks on the Three Dods Menu and selects the Archive action, the action is performed', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const outreachStep = new OutreacheStep(page);

        await test.step('Open Email Account page', async () => {
            await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
            await outreachStep.expectPageTitleIs("Email Accounts");
        });

        await test.step('When the user archived the Email account, the archived Email Account is shown on Email Accounts table', async () => {
            await outreachStep.clickOnMenuActions(outreachTestData.MicrosoftOutlookAccount);
            await outreachStep.selectActionFromMenu('Archive');
        });

        await test.step('Then the updated From Name field is shown on Email Accounts table', async () => {
            await outreachStep.expectCircularProgressHidden();
            await outreachStep.expectStatusIs(outreachTestData.MicrosoftOutlookAccount, 'Archived');
        });
    });

    test('When the user clicks on the Three Dods Menu and selects the Restore action, the action is performed', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const outreachStep = new OutreacheStep(page);

        await test.step('Open Email Account page', async () => {
            await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
            await outreachStep.expectPageTitleIs("Email Accounts");
        });

        await test.step('When the user Restores the Email account', async () => {
            await outreachStep.clickOnMenuActions(outreachTestData.MicrosoftOutlookAccount);
            await outreachStep.selectActionFromMenu('Restore');
        });

        await test.step('Then the Restored item is shown on Email Accounts table', async () => {
            await outreachStep.expectCircularProgressHidden();
            await outreachStep.expectStatusIs(outreachTestData.MicrosoftOutlookAccount, 'Active');
        });
    });
});

test.afterAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const generalStep = new GeneralStep(page);
    const outreachStep = new OutreacheStep(page);
    const loginStep = new LoginStep(page);

    await test.step('Open the page and log in', async () => {
        await generalStep.open();
        await loginStep.login(logInData.username, logInData.password);
        await generalStep.expectPageTitleIs("Dashboard");
    });

    await test.step('Open Email Account page', async () => {
        await generalStep.clickOnMainMenuButton('Outreach', 'Email Accounts');
        await outreachStep.expectPageTitleIs("Email Accounts");
        await outreachStep.expectEmailAccountIsPresented('email', ['prospectaiautotests@gmail.com']);

    });

    await test.step('When the user deletes the test email accounts', async () => {
        const massOfEmailAccounts = [outreachTestData.ImapSmtpAccount, outreachTestData.ImapSmtpAccount1];
        const emails = await outreachStep.getAllEmailAccount();

        for (const emailAccount of massOfEmailAccounts) {

            if (emails && emails.includes(emailAccount)) {
                await outreachStep.clickOnMenuActions(emailAccount);
                await outreachStep.selectActionFromMenu('Delete');
                await generalStep.expectModalIsShown(`Are you sure you want to delete email account ${emailAccount}?`);
                await generalStep.clickOnButton('Delete');
                await generalStep.expectPopUpNotificationIs('Email account has deleted');
                await generalStep.closePopUpNotification();
                await generalStep.expectModalIsNotShown(`Are you sure you want to delete email account ${emailAccount}?`);
            }
        }

        await outreachStep.expectEmailAccountIsNotPresented('email', massOfEmailAccounts);
    });

    await test.step('Then the Deleted item is not shown on Email Accounts table', async () => {
        await outreachStep.expectPageTitleIs("Email Accounts");
        await outreachStep.expectEmailAccountIsNotPresented('email', [outreachTestData.ImapSmtpAccount, outreachTestData.ImapSmtpAccount1]);
    });

    await context.close();
});