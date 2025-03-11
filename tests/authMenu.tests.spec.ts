import { test, expect } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { AuthMenuStep } from '../src/steps/authMenuStep';
import { logInData, profileTestData, integrationTestData, shareWithFriendsTestData } from '../src/helpers/TestConstants';

test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    const loginStep = new LoginStep(page);
    const generalStep = new GeneralStep(page);

    await generalStep.open();
    await loginStep.login(logInData.username, logInData.password);
    await generalStep.expectPageTitleIs("Dashboard");
    await page.waitForURL('https://app.prospectailabs.com/', { timeout: 10000 });
});

test('When the user open Auth menu the following item are shown', async ({ page }) => {
    const generalStep = new GeneralStep(page);

    await test.step('When the user opens Profile menu', async () => {
        await generalStep.openAuthMenu();
    });

    await test.step('The following items are shown', async () => {
        await generalStep.expectProfileMenuUserDataIsVisible(`TP${profileTestData.firstName} ${profileTestData.lastName}`);
        await generalStep.expectAuthMenuItemsArePresented(['My Profile', 'Settings', 'Logout', 'Integrations']);
        await generalStep.expectShareWithFriendsWrapperIsVisible();
    });
});

test.describe('When the user opens Profile page, the user data is shown', () => {

    test('When the user opens the Profile page the user data is shown and editable', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('When the user opens Profile menu and clicks on the My Profile', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['My Profile']);
            await generalStep.clickOnSubAuthMenuButton('My Profile');
            await generalStep.expectPageTitleIs("Profile");
        });

        await test.step('Then the fields are shown prefilled', async () => {
            await generalStep.expectFollowingFieldAreShown(
                ['First Name', 'Last Name', 'Email', 'Country', 'Timezone']);
            await authMenuStep.expectFieldsAreFilled(
                ['Email', 'First Name', 'Last Name', 'Organization Name'],
                [profileTestData.email,
                profileTestData.firstName,
                profileTestData.lastName,
                profileTestData.companyName]);
            await authMenuStep.expectDropdownsInputAreFilled(['Country'], ['Ukraine']);
            await generalStep.expectFieldIsUneditable('Email');
        });

        await test.step('When the user updates profile data and clears all optinal fields', async () => {
            await generalStep.clearInputField('First Name');
            await generalStep.clearInputField('Last Name');
            await generalStep.clearInputField('Organization Name');
            await authMenuStep.openDropdown('Country');
            await generalStep.selectItemFromDropdown('Poland');
            await authMenuStep.openDropdown('Timezone');
            await generalStep.selectItemFromDropdown('(GMT+06:30) Cocos');
            await generalStep.clickOnButton('Save');
        });

        await test.step('Then Account has been updated', async () => {
            await generalStep.expectPopUpNotificationIs("Account has been updated");
            await generalStep.closePopUpNotification();
            await authMenuStep.expectFieldsAreFilled(
                ['First Name', 'Last Name', 'Organization Name'],
                ['', '', '']);
            await authMenuStep.expectDropdownsInputAreFilled(['Country', 'Timezone'], ['Poland', '(GMT+06:30) Cocos']);
        });

        await test.step('When the user edits all fields exsept the \"Email\" field', async () => {
            await generalStep.fillInTheInput('First Name', profileTestData.firstName);
            await generalStep.fillInTheInput('Last Name', profileTestData.lastName);
            await generalStep.fillInTheInput('Organization Name', profileTestData.companyName);
            await authMenuStep.openDropdown('Country');
            await generalStep.selectItemFromDropdown('Ukraine');
            await authMenuStep.openDropdown('Timezone');
            await generalStep.selectItemFromDropdown('Pago Pago');
            await generalStep.clickOnButton('Save');
        });

        await test.step('Then Account has been updated', async () => {
            await authMenuStep.expectFieldsAreFilled(
                ['First Name', 'Last Name', 'Organization Name'],
                [profileTestData.firstName, profileTestData.lastName, profileTestData.companyName]);
            await authMenuStep.expectDropdownsInputAreFilled(['Country', 'Timezone'], ['Ukraine', '(GMT-11:00) Pago Pago']);
        });
    });
});

test.describe('When the user integrates with companies on Integrations page, the connection is successful', () => {
    test('When the user opens the Integrations page, All companies with which integration is possible are shown on the page', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('When the user opens the Integrations page', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
        });

        await test.step('Then the following companies are shown', async () => {
            await generalStep.expectPageTitleIs("Integrations");
            await authMenuStep.expectCompaniesArePresented(['Pitchbox', 'Pipedrive', 'Hubspot', 'BuzzStream', 'Salesforce', 'Salesforce', 'Zoho', 'Monday.com']);
        });
    });

    test('When the user connects with Pitchbox company, the company is connected', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('Integrations page is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
            await generalStep.expectPageTitleIs("Integrations");
        });

        await test.step('When the user connects with Pitchbox company', async () => {
            await authMenuStep.clickOnConnectIntegrationButton('Pitchbox');
        });

        await test.step('Then the company is connected', async () => {
            await generalStep.expectCorrespondingUrl(integrationTestData.urlPitchbox);
            await generalStep.goBackInBrowser();
            await generalStep.expectPageTitleIs("Integrations");
            //await authMenuStep.expectCompaniesAreConnected(['Pitchbox']); //Todo -> after mock connection with Pitchbox company
        });
    });

    test.skip('When the user disconnects the company, the company is disconnected', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('Integrations page is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
            await generalStep.expectPageTitleIs("Integrations");
        });

        await test.step('When the user connects with Pitchbox company', async () => {
            await authMenuStep.clickOnDisconnectIntegrationButton('Pitchbox');
            await generalStep.expectModalIsShown("Are you sure you wish to disconnect from Pitchbox?");
            await generalStep.clickOnButton('Disconnect');
        });

        await test.step('Then the company is disconnected', async () => {
            await generalStep.expectPageTitleIs("Integrations");
            await authMenuStep.expectCompaniesAreDisconnected(['Pitchbox']);
        });
    });

    test('When the user connects with Pipedrive company, the company is connected', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('Integrations page is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
            await generalStep.expectPageTitleIs("Integrations");
        });

        await test.step('When the user connects with Pipedrive company', async () => {
            await authMenuStep.clickOnConnectIntegrationButton('Pipedrive');
        });

        await test.step('Then the company is connected', async () => {
            await generalStep.expectCorrespondingUrl(integrationTestData.urlPipedrive);
            await generalStep.goBackInBrowser();
            await generalStep.expectPageTitleIs("Integrations");
            //await authMenuStep.expectCompaniesAreConnected(['Pipedrive']);//Todo -> after mock connection with company
        });
    });

    test('When the user connects with Hubspot company, the company is connected', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('Integrations page is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
            await generalStep.expectPageTitleIs("Integrations");
        });

        await test.step('When the user connects with Hubspot company', async () => {
            await authMenuStep.clickOnConnectIntegrationButton('Hubspot');
        });

        await test.step('Then the company is connected', async () => {
            await generalStep.expectCorrespondingUrl(integrationTestData.urlHubspot);
            //await generalStep.goBackInBrowser();
            //await generalStep.expectPageTitleIs("Integrations");
            //await authMenuStep.expectCompaniesAreConnected(['Hubspot']);//Todo -> after mock connection with company
        });
    });

    test('When the user connects with BuzzStream company, the company is connected', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('Integrations page is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
            await generalStep.expectPageTitleIs("Integrations");
        });

        await test.step('When the user connects with Hubspot company', async () => {
            await authMenuStep.clickOnConnectIntegrationButton('BuzzStream');
            await generalStep.expectModalIsShown('Connect BuzzStream account');
            await generalStep.fillInTheInput('Consumer Key', integrationTestData.consumerKey);
            await generalStep.fillInTheInput('Consumer Secret', integrationTestData.consumerSecret);
            await generalStep.clickOnButton('Save');
        });

        await test.step('Then the company is connected', async () => {
            await generalStep.expectPopUpNotificationIs('BuzzStream has been connected!');
            await generalStep.closePopUpNotification();
            await generalStep.expectPageTitleIs("Integrations");
            await authMenuStep.expectCompaniesAreConnected(['BuzzStream']);
        });
    });

    test('When the user disconnects BuzzStream company, the company is disconnected', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('Integrations page is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
            await generalStep.expectPageTitleIs("Integrations");
        });

        await test.step('When the user connects with Pitchbox company', async () => {
            await authMenuStep.clickOnDisconnectIntegrationButton('BuzzStream');
            await generalStep.expectModalIsShown("Are you sure you wish to disconnect from BuzzStream?");
            await generalStep.clickOnButton('Disconnect');
        });

        await test.step('Then the company is disconnected', async () => {
            await generalStep.expectPageTitleIs("Integrations");
            await authMenuStep.expectCompaniesAreDisconnected(['BuzzStream']);
        });
    });

    test('When the user connects with Salesforce company, the company is connected', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('Integrations page is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
            await generalStep.expectPageTitleIs("Integrations");
        });

        await test.step('When the user connects with Salesforce company', async () => {
            await authMenuStep.clickOnConnectIntegrationButton('Salesforce');
        });

        await test.step('Then the company is connected', async () => {
            await generalStep.expectCorrespondingUrl(integrationTestData.urlSalesforce);
            await generalStep.goBackInBrowser();
            await page.waitForTimeout(10000);
            await generalStep.expectPageTitleIs("Integrations");
            //await authMenuStep.expectCompaniesAreConnected(['Salesforce']);//Todo -> after mock connection with company
        });
    });

    test('When the user connects with Zoho company, the company is connected', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('Integrations page is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
            await generalStep.expectPageTitleIs("Integrations");
        });

        await test.step('When the user connects with Zoho company', async () => {
            await authMenuStep.clickOnConnectIntegrationButton('Zoho');
        });

        await test.step('Then the company is connected', async () => {
            await generalStep.expectCorrespondingUrl(integrationTestData.urlZoho);
            await generalStep.goBackInBrowser();
            await page.waitForTimeout(10000);
            await generalStep.expectPageTitleIs("Integrations");
            //await authMenuStep.expectCompaniesAreConnected(['Zoho']);//Todo -> after mock connection with company
        });
    });

    test('When the user connects with Monday company, the company is connected', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('Integrations page is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Integrations']);
            await generalStep.clickOnSubAuthMenuButton('Integrations');
            await generalStep.expectPageTitleIs("Integrations");
        });

        await test.step('When the user connects with Monday.com company', async () => {
            await authMenuStep.clickOnConnectIntegrationButton('Monday.com');
        });

        await test.step('Then the company is connected', async () => {
            await generalStep.expectCorrespondingUrl(integrationTestData.urlMonday);
            await generalStep.goBackInBrowser();
            await page.waitForTimeout(10000);
            await generalStep.expectPageTitleIs("Integrations");
            //await authMenuStep.expectCompaniesAreConnected(['Monday.com']);//Todo -> after mock connection with company
        });
    });
});

test.describe('When the user click on "Share with a friend. Earn free credits" link, the Refer a Friend page is opened ', () => {
    test('When the user clicks on "Share with a friend. Earn free credits" the link, the Refer a Friend page is shown', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const authMenuStep = new AuthMenuStep(page);

        await test.step('The user opens Auth menu and clicks on the Share with a friend link', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectShareWithFriendsWrapperIsVisible();
        });

        await test.step('When the user clicks on the Share with a friend link', async () => {
            await generalStep.openReferAFriend();
        });

        await test.step('Then the Refer a Friend page is opened', async () => {
            await generalStep.expectPageTitleIs("Refer a Friend");
            await generalStep.expectPageTitleIs('Get 50 Free Credits—And Give 50 to a Friend!');
            await generalStep.expectPageTitleIs('Your Referral Link');
            await generalStep.expectPageTitleIs('Share & Earn');
            await authMenuStep.expectReferralLinkIsVisible('https://app.prospectailabs.com/sign-up?_by=6wuo9');
            await authMenuStep.expectInviteByEmailInputIsVisible();
        });
    });

    test.describe('When the user sends a referral link, the link is sent to the corresponding email address', () => {
        test('When the user fills in the email field and clicks on the "Send" button, then the invitation is sent to the corresponding email', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const authMenuStep = new AuthMenuStep(page);

            await test.step('The user opens Auth menu and clicks on the Share with a friend link', async () => {
                await generalStep.openAuthMenu();
                await generalStep.expectShareWithFriendsWrapperIsVisible();
                await generalStep.openReferAFriend();
                await generalStep.expectPageTitleIs("Refer a Friend");
            });

            await test.step('When the user fills in the email field and clicks on the "Send" button', async () => {
                await authMenuStep.fillInInviteByEmailInput('qapaitest@outlook.com');
                await generalStep.clickOnButton('Send');
            });

            await test.step('Then the invitation is sent to the corresponding email', async () => {
                await generalStep.expectPopUpNotificationIs('Email has been sent');
                await generalStep.closePopUpNotification();
            });
            //todo -> check the email is received
            //todo -> add approve invitation and check accrued credits 
        });

        test('When the user fills in the email field with incorrect value, the validation error message is received', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const authMenuStep = new AuthMenuStep(page);

            await test.step('The user opens Auth menu and clicks on the Share with a friend link', async () => {
                await generalStep.openAuthMenu();
                await generalStep.expectShareWithFriendsWrapperIsVisible();
                await generalStep.openReferAFriend();
                await await generalStep.expectPageTitleIs("Refer a Friend");
            });

            for (const email of shareWithFriendsTestData.invalidEmails) {
                await test.step(`When the user fills in the email field with ${email} and clicks on the "Send" button`, async () => {
                    await authMenuStep.fillInInviteByEmailInput(email);
                    await generalStep.clickOnButton('Send');
                });

                await test.step('Then the validation error messages is received', async () => {
                    await generalStep.expectValidationMessage('Email address is not valid');
                });
            }
        });
    });
});

test('When a user clicks on Share on Social buttons, it is possible to transfer a referral link through Social', async ({ page }) => {
    const generalStep = new GeneralStep(page);
    const authMenuStep = new AuthMenuStep(page);

    await test.step('The user opens Auth menu and clicks on the Share with a friend link', async () => {
        await generalStep.openAuthMenu();
        await generalStep.expectShareWithFriendsWrapperIsVisible();
        await generalStep.openReferAFriend();
        await generalStep.expectPageTitleIs("Refer a Friend");
        await generalStep.expectPageTitleIs('Share & Earn');
    });

    await test.step('When the user clicks on the Share on Twitter Button, the Twitter is open', async () => {
        await authMenuStep.clickOnOnSocialButtonAndCheckUrl(page, 'https://x.com/intent/tweet?', 'twitter');
    });

    await test.step('When the user clicks on the Share on Facebook Button, the Facebook is open', async () => {
        await authMenuStep.clickOnOnSocialButtonAndCheckUrl(page, 'https://www.facebook.com/', 'facebook');
    });

    await test.step('When the user clicks on the Share on LinkedIn Button, the linkedIn is open', async () => {
        await authMenuStep.clickOnOnSocialButtonAndCheckUrl(page, 'https://www.linkedin.com/', 'linkedin');
    });
})

test('When the user copies the Referral Link to clipboard the link to sign in page Prospect Ai is copied', async ({ browser }) => {
    const context = await browser.newContext({
        permissions: ['clipboard-read', 'clipboard-write'],
    });

    const page = await context.newPage();
    const generalStep = new GeneralStep(page);
    const authMenuStep = new AuthMenuStep(page);
    const loginStep = new LoginStep(page);

    await test.step('Navigate to the application', async () => {
        await generalStep.open();
        await loginStep.login(logInData.username, logInData.password);
        await generalStep.expectPageTitleIs("Dashboard");
        await page.waitForURL('https://app.prospectailabs.com/', { timeout: 10000 });
    });

    await test.step('The user opens Auth menu and clicks on the Share with a friend link', async () => {
        await generalStep.openAuthMenu();
        await generalStep.expectShareWithFriendsWrapperIsVisible();
        await generalStep.openReferAFriend();
    });

    await test.step('When the user copies the Referral Link to clipboard the link to sign in page Prospect Ai is copied', async () => {
        await generalStep.clickOnButton('Copy');
    });

    await test.step('Then the link to sign in page Prospect Ai is copied', async () => {
        await generalStep.expectPopUpNotificationIs('Referral link copied to clipboard');
        await generalStep.closePopUpNotification();

        const copiedText = await page.evaluate(async () => {
            return await navigator.clipboard.readText();
        });

        expect(copiedText).toContain('https://app.prospectailabs.com/sign-up?_by=6wuo9');

        await authMenuStep.focusOnInviteByEmailInput();
        await page.keyboard.press('Control+V');

        await authMenuStep.checkValueFromInviteByEmailInputIs('https://app.prospectailabs.com/sign-up?_by=6wuo9');
    });
});