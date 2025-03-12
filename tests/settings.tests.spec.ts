import { test, expect } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { AuthMenuStep } from '../src/steps/authMenuStep';
import { SettingsStep } from '../src/steps/settingsStep';
import { logInData, resetPasswordTestData, yearTeamTestData, testDataSubscriptionPlans } from '../src/helpers/TestConstants';
import { VerifyEmailSearchStep } from '../src/steps/verifyEmailSearchStep';
import { TemporaryInboxStep } from '../src/steps/temporaryInboxStep';
import { MailTmResponse } from '../src/models/mailTmResponseModel';

test('When the user opens Settings page, the following items are shown', async ({ page }) => {
    const generalStep = new GeneralStep(page);
    const loginStep = new LoginStep(page);

    await test.step('Navigate to the application', async () => {
        await generalStep.open();
        await loginStep.login(logInData.username, logInData.password);
        await generalStep.expectPageTitleIs("Dashboard");
    });

    await test.step('Settings Auth menu is opened', async () => {
        await generalStep.openAuthMenu();
        await generalStep.expectAuthMenuItemsArePresented(['Settings']);
    });

    await test.step('When the user opens Settings page', async () => {
        await generalStep.clickOnSubAuthMenuButton('Settings');
    });

    await test.step('The following items are shown', async () => {
        await generalStep.expectAuthMenuItemsArePresented(['Light Theme', 'Password reset', 'Team', 'Refer a Friend', 'Tags Management', 'Usage', 'Subscription', 'Billing', 'API Key']);
    });
});

test.describe('When the user resetes password on Password Reset page, the password is updated', () => {
    test('When the user resetes password with valid data on Password Reset page, the password is updated', async ({ page }) => {
        test.setTimeout(test.info().timeout + 60000);
        const generalStep = new GeneralStep(page);
        const loginStep = new LoginStep(page);
        let oldPassword = resetPasswordTestData.password;

        await test.step('Navigate to the application', async () => {
            await generalStep.open();
            await loginStep.login(resetPasswordTestData.email, resetPasswordTestData.password);
            await generalStep.expectPageTitleIs("Dashboard");
        });

        await test.step('Settings Auth menu is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Settings']);
        });

        await test.step('When the user opens Password Reset page', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Password Reset');
            await generalStep.expectPageTitleIs("Password Reset");
        });

        await test.step('The following fields are shown', async () => {
            await generalStep.expectFollowingFieldAreShown(['Old Password', 'New Password', 'Confirm New Password']);
        });

        for (const passw of resetPasswordTestData.validPasswords) {
            await test.step(`When the user fills in the Password fields with ${passw} and clicks on the 'Update Settings' button`, async () => {
                await generalStep.fillInTheInput("Old Password", oldPassword);
                await loginStep.clickVisibilityIcon();
                await generalStep.fillInTheInput("New Password", passw);
                await loginStep.clickVisibilityIcon();
                await generalStep.fillInTheInput("Confirm New Password", passw);
                await loginStep.clickVisibilityIcon();
                await generalStep.clickOnButton('Update Settings');
                oldPassword = passw;
            });

            await test.step('Then the password is updated ', async () => {
                await generalStep.expectPopUpNotificationIs("Password was updated");
                await generalStep.closePopUpNotification();
            });
        }
    });

    test('When the user resetes password with invalid data on Password Reset page, the validation error message is received', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const loginStep = new LoginStep(page);

        await test.step('Navigate to the application', async () => {
            await generalStep.open();
            await loginStep.login(resetPasswordTestData.email, resetPasswordTestData.password);
            await generalStep.expectPageTitleIs("Dashboard");
        });

        await test.step('Settings Auth menu is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Settings']);
        });

        await test.step('When the user opens Password Reset page', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Password Reset');
            await generalStep.expectPageTitleIs("Password Reset");
        });

        for (const password of resetPasswordTestData.invalidPasswords) {
            await test.step(`When the user fills in the Password fields with ${password} and clicks on the 'Update Settings' button`, async () => {
                await generalStep.fillInTheInput("Old Password", resetPasswordTestData.password);
                await loginStep.clickVisibilityIcon();
                await generalStep.fillInTheInput("New Password", password);
                await loginStep.clickVisibilityIcon();
                await generalStep.fillInTheInput("Confirm New Password", password);
                await loginStep.clickVisibilityIcon();
                await generalStep.clickOnButton('Update Settings');
            });

            await test.step('Then the validation error messages is received', async () => {
                await generalStep.expectValidationMessage('Password must contain between 8 and 64 characters, including at least one uppercase letter and one number');
            });
        }

        await test.step(`When the user does not fill in the Password fields and clicks on the 'Update Settings' button`, async () => {
            await generalStep.clearInputField("Old Password");
            await generalStep.clearInputField("New Password");
            await generalStep.clickOnButton('Update Settings');
            await generalStep.expectTheButtonIsDisabled('Update Settings');
        });

        await test.step('Then the validation error messages is received', async () => {
            await generalStep.expectValidationMessage('This field is required');
        });

        await test.step('When the user fills in the fields with not matched passwords and clicks on the "Update Settings" button', async () => {
            await generalStep.fillInTheInput("Old Password", resetPasswordTestData.password);
            await generalStep.fillInTheInput("New Password", resetPasswordTestData.validPasswords[0]);
            await generalStep.fillInTheInput("Confirm New Password", resetPasswordTestData.validPasswords[1]);
            await generalStep.clickOnButton('Update Settings');
        });

        await test.step('Then the validation error message is received', async () => {
            await generalStep.expectValidationMessage("The passwords don't match");
        });

        await test.step('When the user changes password with incorrect Old Password value the Pop up Notification is shown', async () => {
            await generalStep.fillInTheInput("Old Password", resetPasswordTestData.validPasswords[0]);
            await generalStep.fillInTheInput("New Password", resetPasswordTestData.validPasswords[0]);
            await generalStep.fillInTheInput("Confirm New Password", resetPasswordTestData.validPasswords[0]);
            await generalStep.clickOnButton('Update Settings');
        });

        await test.step('Then the validation error message is received', async () => {
            await generalStep.expectPopUpNotificationIs("Incorrect password");
            await generalStep.closePopUpNotification();
        });

        await test.step('When the user changes password to Old Password the Pop up Notification is shown with error', async () => {
            await generalStep.fillInTheInput("Old Password", resetPasswordTestData.password);
            await generalStep.fillInTheInput("New Password", resetPasswordTestData.password);
            await generalStep.fillInTheInput("Confirm New Password", resetPasswordTestData.password);
            await generalStep.clickOnButton('Update Settings');
        });

        await test.step('Then the validation error message is received', async () => {
            await generalStep.expectPopUpNotificationIs("New password must be different from the old one");
            await generalStep.closePopUpNotification();
        });
    });
});

test.describe('The team enjoys prospecting together', () => {
    test.describe.serial('1. When the team enjoys prospecting together the team has the following opportunity', () => {
        test.setTimeout(80000);
        let confirmationLink: string;
        const emailFilePath = '/temporaryEmail.txt';
        const tokenFilePath = '/temporaryToken.txt';
        let inbox: MailTmResponse;
        let token: string;

        test('Create temporary Email Inbox', async ({ page }) => {
            const temporaryInboxStep = new TemporaryInboxStep(page);

            await test.step('Create temporary Email Inbox', async () => {
                inbox = await temporaryInboxStep.getTemporaryEmail(emailFilePath, tokenFilePath);
                expect(inbox).toBeDefined();
                console.log(`Temporary email: ${inbox.address}`);
            });

            await test.step('Create temporary Token', async () => {
                token = await temporaryInboxStep.getTemporaryToken(emailFilePath, tokenFilePath);
                expect(token).toBeDefined();
                console.log(`Temporary token: ${token}`);
            });

            await test.step('Clear temporary Email Inbox', async () => {
                expect(token).toBeDefined();
                await temporaryInboxStep.clearInbox(token);
            });

        });

        test('When the user deletes not accepted team member the team memeber is removed', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const loginStep = new LoginStep(page);
            const settingsStep = new SettingsStep(page);

            await test.step('Open the page and log in', async () => {
                await generalStep.open();
                await loginStep.login(logInData.username, logInData.password);
                await generalStep.expectPageTitleIs("Dashboard");
            });

            await test.step('Year Team page is opened', async () => {
                await generalStep.openAuthMenu();
                await generalStep.expectAuthMenuItemsArePresented(['Settings']);
                await generalStep.clickOnSubAuthMenuButton('Settings', 'Team');
                await generalStep.expectPageTitleIs("Your Team");
                await settingsStep.expectYearTeamContentIsVisible();
            });

            await test.step('Delete team members', async () => {
                if (inbox) {
                    const teamMember = await settingsStep.getTeamMember(inbox.address);
                    if ((teamMember) && (await teamMember.count()) > 0) {
                        teamMember.hover();
                        await generalStep.clickOnButton('Delete');
                        await generalStep.expectModalIsShown("Are you sure you want to delete this user?");
                        await generalStep.clickOnButton('Delete');
                        await generalStep.expectPopUpNotificationIs("User has been deleted");
                        await generalStep.closePopUpNotification();
                    }
                    await settingsStep.expectTeamMemberIsNotShown(inbox.address);
                }
            });
        });

        test('When the user invites other team members on Your Team page, the team members are added to the team', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const settingsStep = new SettingsStep(page);
            const loginStep = new LoginStep(page);
            const temporaryInboxStep = new TemporaryInboxStep(page);

            await test.step('Navigate to the application', async () => {
                await generalStep.open();
                await loginStep.login(logInData.username, logInData.password);
                await generalStep.expectPageTitleIs("Dashboard");
            });

            await test.step('Year Team page is opened', async () => {
                await generalStep.openAuthMenu();
                await generalStep.expectAuthMenuItemsArePresented(['Settings']);
                await generalStep.clickOnSubAuthMenuButton('Settings', 'Team');
                await generalStep.expectPageTitleIs("Your Team");
                await settingsStep.expectYearTeamContentIsVisible();
                await generalStep.expectButtonIsVisible('Add User');
            });

            await test.step('When the user invites a new team member on Year Team page', async () => {
                await generalStep.clickOnButton('Add User');
                await generalStep.expectModalIsShown("Add User");
                await generalStep.fillInTheInput('Email', inbox.address);
                await generalStep.clickOnButton('Save');
            });

            await test.step('The new team member is added to the team', async () => {
                await generalStep.expectPopUpNotificationIs("Invitation sent");
                await generalStep.closePopUpNotification();
                await settingsStep.expectTeamMembersAre(yearTeamTestData.testTeamMembers.concat(inbox.address));
            });
        });

        test('When a user resends the invite, the invitation is sent again.', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const loginStep = new LoginStep(page);
            const settingsStep = new SettingsStep(page);
            const temporaryInboxStep = new TemporaryInboxStep(page);

            console.log(`Inbox: ${inbox}`);
            console.log(`Token: ${token}`);

            await test.step('Open the page and log in', async () => {
                await generalStep.open();
                await loginStep.login(logInData.username, logInData.password);
                await generalStep.expectPageTitleIs("Dashboard");
            });

            await test.step('Year Team page is opened', async () => {
                await generalStep.openAuthMenu();
                await generalStep.expectAuthMenuItemsArePresented(['Settings']);
                await generalStep.clickOnSubAuthMenuButton('Settings', 'Team');
                await generalStep.expectPageTitleIs("Your Team");
                await settingsStep.expectYearTeamContentIsVisible();
            });

            await test.step('When the user clicks on Resend invite button', async () => {
                if (inbox) {
                    const teamMember = await settingsStep.getTeamMember(inbox.address);
                    if ((teamMember) && (await teamMember.count()) > 0) {
                        teamMember.hover();
                        await generalStep.clickOnButton('Resend Invite');
                    }
                }
            });

            await test.step('The invite is sent again', async () => {
                await generalStep.expectPopUpNotificationIs("Invitation sent");
                await generalStep.closePopUpNotification();
                await temporaryInboxStep.expectUnseenMessagesInInbox(token);
            });
        });

        test('When the user accepts invite a new team member on Your Team page, the new team member logs in to ProspectAi', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const settingsStep = new SettingsStep(page);
            const temporaryInboxStep = new TemporaryInboxStep(page);
            expect(inbox).toBeDefined();
            expect(token).toBeDefined();
            console.log(`1Temporary token: ${token}`);
            console.log(`1Temporary email: ${inbox.address}`);

            await test.step('When the user opens corresponding email and goes to the confirmation link', async () => {
                await temporaryInboxStep.gotoConfirmationLink(token, "Join Prospect AI - Accept Your Invitation Now");
                confirmationLink = await temporaryInboxStep.getConfirmationLink(token, "Join Prospect AI - Accept Your Invitation Now");
                console.log(`Confirmation link: ${confirmationLink}`);
            });

            await test.step('Then the invitation page is opened', async () => {
                await generalStep.expectCorrespondingUrl("//app.prospectailabs.com/team/members/invitation/**");
                await generalStep.expectPageTitleIs("Congratulations!");
                await generalStep.expectTheButtonIsDisabled('Complete Registration');
            });

            await test.step('When the user fills in the password and clicks on the "Complete Registration" button', async () => {
                await generalStep.fillInTheInput("Password", logInData.password);
                await generalStep.fillInTheInput("Confirm Password", logInData.password);
                await generalStep.clickOnButton('Complete Registration');
            });

            await test.step('The Sign in page is opened', async () => {
                await generalStep.expectPageTitleIs("Sign in to your account");
                await generalStep.expectCorrespondingUrl("//app.prospectailabs.com/sign-in**");
                await generalStep.fillInTheInput("Email", inbox.address);
                await generalStep.fillInTheInput("Password", logInData.password);
                await generalStep.clickOnButton('Login');
            });

            await test.step('Thanks For Joining Page is opened', async () => {
                await settingsStep.expectTermsThanksForJoiningPageIsVisible();
                await generalStep.expectTheButtonIsDisabled('Complete Sign Up');
                await settingsStep.clickOnCheckbox();
                await generalStep.expectTheButtonIsEnabled('Complete Sign Up');
                await generalStep.clickOnButton('Complete Sign Up');
            });

            await test.step('The user logs in to Prospect successfully', async () => {
                await generalStep.expectPageTitleIs("Dashboard");
                await generalStep.openAuthMenu();
                await generalStep.expectProfileMenuUserDataIsVisible(`${inbox.address}`);
            });
        });

        test('When the user goes to the confirmation link one more time, the the pop up notifies that the user already exist', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const temporaryInboxStep = new TemporaryInboxStep(page);
            expect(inbox).toBeDefined();
            expect(token).toBeDefined();
            console.log(`confirmationLink ${confirmationLink}`)

            inbox = await temporaryInboxStep.getTemporaryEmail(emailFilePath, tokenFilePath);
            token = await temporaryInboxStep.getTemporaryToken(emailFilePath, tokenFilePath);

            await test.step('The the invitation page is opened', async () => {
                //await temporaryInboxStep.gotoConfirmationLink(token, "Join Prospect AI - Accept Your Invitation Now");
                await page.goto(confirmationLink);
                await generalStep.expectCorrespondingUrl("//app.prospectailabs.com/team/members/invitation/**");
                await generalStep.expectPageTitleIs("Congratulations!");
                await generalStep.expectTheButtonIsDisabled('Complete Registration');
            });

            await test.step(`When the user completes Registration via the same confirmation link`, async () => {
                await generalStep.fillInTheInput("Password", logInData.password);
                await generalStep.fillInTheInput("Confirm Password", logInData.password);
                await generalStep.clickOnButton('Complete Registration');
            });

            await test.step('Then the validation error messages is received', async () => {
                await generalStep.expectPopUpNotificationIs("User already accepted invitation");
                await generalStep.closePopUpNotification();
            });
        });
    });

    test.describe('2. When the team enjoys prospecting together the team has the following opportunity', () => {
        test('When the user goes to the confirmation link and fills the password field with Valid data, the registration process completed ', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const loginStep = new LoginStep(page);

            await test.step('The the invitation page is opened', async () => {
                await page.goto(yearTeamTestData.confirmationLinkTest);
                await generalStep.expectCorrespondingUrl("//app.prospectailabs.com/team/members/invitation/**");
                await generalStep.expectPageTitleIs("Congratulations!");
                await generalStep.expectTheButtonIsDisabled('Complete Registration');
            });

            for (const password of yearTeamTestData.validPasswords) {
                await test.step(`When the user fills in the Password fields with ${password} and clicks on the 'Complete Registration' button`, async () => {
                    await generalStep.fillInTheInput("Password", password);
                    await loginStep.clickVisibilityIcon();
                    await generalStep.fillInTheInput("Confirm Password", password);
                    await generalStep.clickOnButton('Complete Registration');
                });

                await test.step('Then the validation error messages is received', async () => {
                    await generalStep.expectValidationMessageIsNotVisible();
                });
            }
        });

        test('When the user goes to the confirmation link and fills the password field with Invalid data the validation error message is received', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const loginStep = new LoginStep(page);

            await test.step('The the invitation page is opened', async () => {
                await page.goto(yearTeamTestData.confirmationLinkTest);
                await generalStep.expectCorrespondingUrl("//app.prospectailabs.com/team/members/invitation/**");
                await generalStep.expectPageTitleIs("Congratulations!");
                await generalStep.expectTheButtonIsDisabled('Complete Registration');
            });

            for (const password of yearTeamTestData.invalidPasswords) {
                await test.step(`When the user fills in the Password fields with ${password} and clicks on the 'Complete Registration' button`, async () => {
                    await generalStep.fillInTheInput("Password", password);
                    await loginStep.clickVisibilityIcon();
                    await generalStep.fillInTheInput("Confirm Password", password);
                    await generalStep.clickOnButton('Complete Registration');
                });

                await test.step('Then the validation error messages is received', async () => {
                    await generalStep.expectValidationMessage('Password must contain between 8 and 64 characters, including at least one uppercase letter and one number');
                });
            }

            await test.step('When the user fills in the fields with not matched passwords and clicks on the "Complete Registration" button', async () => {
                await generalStep.clearInputField("Password");
                await generalStep.expectTheButtonIsDisabled('Complete Registration');
                await generalStep.fillInTheInput("Password", logInData.password);
                await generalStep.fillInTheInput("Confirm Password", logInData.password + "1");
                await generalStep.expectTheButtonIsEnabled('Complete Registration');
                await generalStep.clickOnButton('Complete Registration');
            });

            await test.step('The validation error message is received', async () => {
                await generalStep.expectValidationMessage("The passwords don't match");
            });
        });

        test('When the user invites already existing team members on Your Team page, the error message is received', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const settingsStep = new SettingsStep(page);
            const loginStep = new LoginStep(page);

            await test.step('Navigate to the application', async () => {
                await generalStep.open();
                await loginStep.login(logInData.username, logInData.password);
                await generalStep.expectPageTitleIs("Dashboard");
            });

            await test.step('Year Team page is opened', async () => {
                await generalStep.openAuthMenu();
                await generalStep.expectAuthMenuItemsArePresented(['Settings']);
                await generalStep.clickOnSubAuthMenuButton('Settings', 'Team');
                await generalStep.expectPageTitleIs("Your Team");
                await settingsStep.expectYearTeamContentIsVisible();
                await settingsStep.expectTeamMembersAre(yearTeamTestData.testTeamMembers);
                await generalStep.expectButtonIsVisible('Add User');
            });

            await test.step('When the user invites a new team member on Year Team page', async () => {
                await generalStep.clickOnButton('Add User');
                await generalStep.expectModalIsShown("Add User");
                await generalStep.fillInTheInput('Email', yearTeamTestData.inboxEmail);
                await generalStep.clickOnButton('Save');
            });

            await test.step('The new team member is added to the team', async () => {
                await generalStep.expectPopUpNotificationIs("A user with this email address already exists. You cannot invite a team member with this email address.");
                await generalStep.closePopUpNotification();
            });
        });

        test('When the user edits a team member\'s name and role, the team member is updeted', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const settingsStep = new SettingsStep(page);
            const loginStep = new LoginStep(page);
            const authMenuStep = new AuthMenuStep(page);

            await test.step('Navigate to the application', async () => {
                await generalStep.open();
                await loginStep.login(logInData.username, logInData.password);
                await generalStep.expectPageTitleIs("Dashboard");
            });

            await test.step('Year Team page is opened', async () => {
                await generalStep.openAuthMenu();
                await generalStep.expectAuthMenuItemsArePresented(['Settings']);
                await generalStep.clickOnSubAuthMenuButton('Settings', 'Team');
                await generalStep.expectPageTitleIs("Your Team");
                await settingsStep.expectYearTeamContentIsVisible();
                await settingsStep.expectTeamMembersAre(yearTeamTestData.testTeamMembers);
            });

            await test.step('When the user opens edit modal window', async () => {
                const teamMember = await settingsStep.getTeamMember(yearTeamTestData.testTeamMembers[2]);
                if (await teamMember.count() > 0) {
                    teamMember.hover();
                    await generalStep.clickOnButton('Edit');
                    await generalStep.expectModalIsShown("Edit User");
                }
            });

            await test.step('The fields are shown prefilled', async () => {
                await generalStep.expectFollowingFieldAreShown(
                    ['First name', 'Last name', 'Email']);
                await authMenuStep.expectFieldsAreFilled(
                    ['First name', 'Last name', 'Email'],
                    ['Test', 'ProspectAi', yearTeamTestData.testTeamMembers[2]]);
                await settingsStep.expectRoleDropdownIs('User');
                await generalStep.expectFieldIsUneditable('Email');
            });

            await test.step('When the user updates team member\'s data and clears all optinal fields', async () => {
                await settingsStep.clearInputField('First Name');
                await settingsStep.clearInputField('Last Name');
                await authMenuStep.openDropdown('Role');
                await generalStep.selectItemFromDropdown('Admin');
                await generalStep.clickOnButton('Save');
            });

            await test.step('The team member is updeted', async () => {
                await generalStep.expectPopUpNotificationIs("Changes saved");
                await generalStep.closePopUpNotification();
                await generalStep.expectModalIsNotShown("Edit User");
            });

            await test.step('When the user opens edit modal window', async () => {
                const teamMember = await settingsStep.getTeamMember(yearTeamTestData.testTeamMembers[2]);
                if (await teamMember.count() > 0) {
                    teamMember.hover();
                    await generalStep.clickOnButton('Edit');
                    await generalStep.expectModalIsShown("Edit User");
                }
            });

            await test.step('The fields are shown prefilled', async () => {
                await authMenuStep.expectFieldsAreFilled(
                    ['First name', 'Last name'],
                    ['', '']);
                await settingsStep.expectRoleDropdownIs('Admin');
            });

            await test.step('When the user updates team member\'s data', async () => {
                await settingsStep.fillInInputField('First Name', 'Test');
                await settingsStep.fillInInputField('Last Name', 'ProspectAi');
                await authMenuStep.openDropdown('Role');
                await generalStep.selectItemFromDropdown('User');
                await generalStep.clickOnButton('Save');
            });

            await test.step('The team member is updeted', async () => {
                await generalStep.expectPopUpNotificationIs("Changes saved");
                await generalStep.closePopUpNotification();
                await generalStep.expectModalIsNotShown("Edit User");
            });
        });

        test('When the team memeber with role \'Admin\' logs In Prospect Ai the user has the Full access to all features, plus user management', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const settingsStep = new SettingsStep(page);
            const loginStep = new LoginStep(page);

            await test.step('When the team memeber with role \'Admin\' logs In Prospect Ai', async () => {
                await generalStep.open();
                await loginStep.login(yearTeamTestData.testTeamMembers[1], logInData.password);
                await generalStep.expectPageTitleIs("Dashboard");
            });

            await test.step('And the user opens Settings menu', async () => {
                await generalStep.openAuthMenu();
                await generalStep.expectAuthMenuItemsArePresented(['Settings']);
                await generalStep.clickOnSubAuthMenuButton('Settings');
            });

            await test.step('The following items are shown', async () => {
                await generalStep.expectAuthMenuItemsArePresented(['Light Theme', 'Password reset', 'Team', 'Refer a Friend', 'Tags Management', 'Usage', 'Subscription', 'Billing', 'API Key']);
            });

            await test.step('The team memeber with role \'Admin\' has opportunity to add team member on Year Team page', async () => {
                await generalStep.clickOnSubAuthMenuButton('Team');
                await generalStep.expectPageTitleIs("Your Team");
                await settingsStep.expectYearTeamContentIsVisible();
                await settingsStep.expectTeamMembersAre(yearTeamTestData.testTeamMembers);
                await settingsStep.expectTeamMembersRoleIs(yearTeamTestData.testTeamMembers[1], 'admin');
                await generalStep.expectButtonIsVisible('Add User');
            });

            await test.step('The team memeber with role \'Admin\' has opportunity to edit and delete team members on Year Team page', async () => {
                await (await settingsStep.getTeamMember(yearTeamTestData.testTeamMembers[2])).hover();
                await generalStep.expectButtonIsVisible('Edit');
            });

            await test.step('The team memeber with role \'Admin\' has opportunity to delete team members on Year Team page', async () => {
                await (await settingsStep.getTeamMember(yearTeamTestData.inboxEmail)).hover();
                await generalStep.expectButtonIsVisible('Delete');
            });

            await test.step('The team memeber with role \'Admin\' has opportunity to archived accepted team member on Year Team page', async () => {
                await (await settingsStep.getTeamMember(yearTeamTestData.testTeamMembers[2])).hover();
                await generalStep.expectButtonIsVisible('Edit');
                await generalStep.expectButtonIsVisible('Archive');
                await generalStep.clickOnButton('Archive');
                await generalStep.expectModalIsShown("User has activity history and will be archived");
                await generalStep.clickOnButton('Archive');
                await generalStep.expectPopUpNotificationIs("User has been archived");
                await generalStep.closePopUpNotification();
                await settingsStep.expectTeamMemberIsNotShown(yearTeamTestData.testTeamMembers[2]);
            });

            await test.step('The team memeber with role \'Admin\' has opportunity to restore accepted team member on Year Team page', async () => {
                await generalStep.clickOnButton('View Archived Users');
                await settingsStep.expectTeamMembersAre([yearTeamTestData.testTeamMembers[2]]);
                await (await settingsStep.getTeamMember(yearTeamTestData.testTeamMembers[2])).hover();
                await generalStep.expectButtonIsVisible('Restore');
                await generalStep.clickOnButton('Restore');
                await generalStep.expectPopUpNotificationIs("User has been restored");
                await generalStep.closePopUpNotification();
                await settingsStep.expectTeamMembersAre(yearTeamTestData.testTeamMembers);
            });
        });

        test('When the team memeber with role \'User\' logs In ProspectAi the user has Access to all features but has not to user or billing management.', async ({ page }) => {
            const generalStep = new GeneralStep(page);
            const settingsStep = new SettingsStep(page);
            const loginStep = new LoginStep(page);

            await test.step('When the team memeber with role \'User\' logs In Prospect Ai', async () => {
                await generalStep.open();
                await loginStep.login(yearTeamTestData.testTeamMembers[2], logInData.password);

                await generalStep.expectPageTitleIs("Dashboard");
            });

            await test.step('And the user opens Settings menu', async () => {
                await generalStep.openAuthMenu();
                await generalStep.expectAuthMenuItemsArePresented(['Settings']);
                await generalStep.clickOnSubAuthMenuButton('Settings');
            });

            await test.step('The following items are shown', async () => {
                await generalStep.expectAuthMenuItemsArePresented(['Light Theme', 'Password reset', 'Team', 'Refer a Friend', 'Tags Management', 'API Key']);
            });

            await test.step('Opportunity to add team member is absent on Year Team page', async () => {
                await generalStep.clickOnSubAuthMenuButton('Team');
                await generalStep.expectPageTitleIs("Your Team");
                await settingsStep.expectYearTeamContentIsVisible();
                await settingsStep.expectTeamMembersAre(yearTeamTestData.testTeamMembers);
                await settingsStep.expectTeamMembersRoleIs(yearTeamTestData.testTeamMembers[2], 'User');
                await generalStep.expectButtonIsNotVisible('Add User');
            });

            await test.step('Opportunity to edit and delete team members is absent on Year Team page', async () => {
                await (await settingsStep.getTeamMember(yearTeamTestData.testTeamMembers[2])).hover();
                await generalStep.expectButtonIsNotVisible('Edit');
                await generalStep.expectButtonIsNotVisible('Delete');
            });
        });
    });
});

test.describe.serial('When the user goes to API Keys tab, there are opportunities to generate a key API and see the API docs', () => {
    test.beforeEach(async ({ page }) => {
        const loginStep = new LoginStep(page);
        const generalStep = new GeneralStep(page);

        await generalStep.open();
        await loginStep.login(logInData.username, logInData.password);
        await generalStep.expectPageTitleIs("Dashboard");
        await generalStep.openAuthMenu();
        await generalStep.expectAuthMenuItemsArePresented(['Settings']);
    });

    test('Delete Api Keys if exists', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('The API Keys page is opened', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'API Keys');
            await generalStep.expectPageTitleIs('API Keys');
        });

        await test.step('When the user Delete the API Keys', async () => {
            await generalStep.waitForProgressBarIsHidden();
            await settingsStep.deleteApiKeys('Delete', 'TestApiKey');
        });

        await test.step('API Keys is not shown', async () => {
            await settingsStep.expectAPIKeysIsNotVisible('TestApiKeyEdited');
            await settingsStep.expectAPIKeysIsNotVisible('TestApiKey');
        });
    });

    test('When the user generates Api Key, the Api key is shown', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('The API Keys page is opened', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'API Keys');
            await generalStep.expectPageTitleIs('API Keys');
        });

        await test.step('When the user generates the API Key', async () => {
            await generalStep.expectButtonIsVisible('API Key');
            await generalStep.clickOnButton('API Key');
            await generalStep.expectModalIsShown('Add API Key');
            await generalStep.fillInTheInput('API key name', 'TestApiKey');
            await generalStep.clickOnButton('Save');
        });

        await test.step('The API Key is shown', async () => {
            await generalStep.expectPopUpNotificationIs('API Key has been created!');
            await generalStep.closePopUpNotification();
            await generalStep.expectModalIsNotShown('Add API Key');
            await settingsStep.expectAPIKeysContentIsVisible('TestApiKey');
            // settingsStep.expectAPIKeysAreNotExpired('TestApiKey'); //todo
        });
    });

    test('The user can perform the following actions with the API Key:', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('The API Keys page is opened', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'API Keys');
            await generalStep.expectPageTitleIs('API Keys');
        });

        await test.step('When the user Copy the API Key', async () => {
            await settingsStep.clickOnCopyButtonCorrespondingApiKey('Copy', 'TestApiKey');
        });

        await test.step('The API Key is copied to clipboard', async () => {
            //todo check copied value 
        });

        await test.step('When the user Edit the API Key', async () => {
            await settingsStep.clickOnActionButtonCorrespondingApiKey('Edit', 'TestApiKey');
            await generalStep.expectModalIsShown('Edit API Key');
            await generalStep.clearInputField('API key name');
            await generalStep.fillInTheInput('API key name', 'TestApiKeyEdited');
            await generalStep.expectTheButtonIsEnabled('Save');
            await generalStep.clickOnButton('Save');
            await settingsStep.expectAPIKeysContentIsVisible('TestApiKeyEdited');
        });

        await test.step('The API Key name is updated', async () => {
            await generalStep.expectPopUpNotificationIs('API Key has been updated!');
            await generalStep.closePopUpNotification();
            await settingsStep.expectAPIKeysContentIsVisible('TestApiKeyEdited');
        });
    });

    test('When a user opens the API documentation, the API documentation is displayed.', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('The API Keys page is opened', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'API Keys');
            await generalStep.expectPageTitleIs('API Keys');
            await generalStep.expectButtonIsVisible('API DOCS');
        });

        await test.step('When the user opens the API documentation the corresponding url is opened', async () => {
            await settingsStep.clickOnButtonAndCheckUrl(page, 'https://api.prospectailabs.com/v2/docs/', 'API DOCS');
        });
    });
});

test.describe('When the user opens Subscription page, the user can subscribe to available plan or buy credits', () => {
    test.beforeEach(async ({ page }) => {
        const loginStep = new LoginStep(page);
        const generalStep = new GeneralStep(page);

        await generalStep.open();
        await loginStep.login(logInData.username, logInData.password);
        await generalStep.expectPageTitleIs("Dashboard");
        await generalStep.openAuthMenu();
        await generalStep.expectAuthMenuItemsArePresented(['Settings']);
    });

    test('When the user opens Subscription page, the user can review plans', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('When the user opens Subscription page', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Subscription');
            await generalStep.expectPageTitleIs('Subscription');
        });

        await test.step('The following items are shown', async () => {
            await settingsStep.expectActiveSwitcherPositionIs('Pay Monthly');
            await settingsStep.expectSubscriptionPlansWithPricesAre(testDataSubscriptionPlans.payMonthlySubscriptionPlans,
                testDataSubscriptionPlans.payMonthlySubscriptionPlansWithPrices);
            await settingsStep.expectCurrentSubscriptionItemIs('Basic - Monthly');
            await settingsStep.expectDisabledSubscriptionItemIs(['Pro - Daily']);
        });

        await test.step('When the user clicks on "Buy Credits" button', async () => {
            await settingsStep.clickOnSwitcherPosition('Buy Credits');
        });

        await test.step('Then The following items are shown', async () => {
            await settingsStep.expectActiveSwitcherPositionIs('Buy Credits');
            await settingsStep.expectSubscriptionPlansWithPricesAre(testDataSubscriptionPlans.buyCreditsSubscriptionPlans,
                testDataSubscriptionPlans.buyCreditsSubscriptionPlansPrices);
        });
    });

    test('When the user selects available Subscription plan, The Payment system page opens', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('The user opens Subscription page', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Subscription');
            await generalStep.expectPageTitleIs('Subscription');
        });

        await test.step('When the user selects the available Subscription plan', async () => {
            await settingsStep.selectSubscriptionPlan('Basic - Yearly');
        });

        await test.step('The Payment system page opens', async () => {
            await generalStep.expectCorrespondingUrl('//checkout.stripe.com/**');
            // todo mock response from payment system
        });
    });

    test('When the user selects "Free" plan, the user can review current plan', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('The user opens Subscription page', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Subscription');
            await generalStep.expectPageTitleIs('Subscription');
        });

        await test.step('When the user selects "Free" plan', async () => {
            await settingsStep.selectSubscriptionPlan('Free');
        });

        await test.step('The current subscription will be canceled and free plan will be selected', async () => {
            await generalStep.expectModalIsShown('Your current subscription will be canceled and free plan will be selected?');
            //await generalStep.clickOnButton('Confirm'); //after mock response from payment system
            //await generalStep.expectPopUpNotificationIs('Your subscription has been canceled');
            //await generalStep.closePopUpNotification();
            //await generalStep.expectPageTitleIs('Subscription');
        });
    });

    test('When the user clicks on current Subscription plan, the user can review it', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('The user opens Subscription page', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Subscription');
            await generalStep.expectPageTitleIs('Subscription');
        });

        await test.step('When the user clicks on current plan', async () => {
            await settingsStep.clickOnTheCurrentSubscription('Basic - Monthly');
        });

        await test.step('The user can review current plan', async () => {
            await settingsStep.expectActiveSubscriptionIsShown('Basic - Monthly', '1000 monthly credits');
            await settingsStep.expectCreditsAreAvailable('1000');
            await generalStep.expectTheButtonIsEnabled('Cancel Subscription');
            await generalStep.expectTheButtonIsEnabled('Update My Plan');
        });
    });

    test('When the user clicks on "Cancel Subscription", the user has following opportunities', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('The Subscription page is opened', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Subscription');
            await generalStep.expectPageTitleIs('Subscription');
        });

        await test.step('The Current Subscription page is opened', async () => {
            await settingsStep.clickOnTheCurrentSubscription('Basic - Monthly');
            await generalStep.expectPageTitleIs('Subscription');
        });

        await test.step('When the click on "Cancel Subscription" button', async () => {
            await generalStep.clickOnButton('Cancel Subscription');
        });

        await test.step('The user can move to Free plan', async () => {
            await generalStep.expectPageTitleIs('Cancel Subscription');
            await settingsStep.expectSubscriptionPlansWithPricesAre(['Free'],
                ['FreeForever free plan$0.00/daySelect']);
            //await settingsStep.selectSubscriptionPlan('Free');
            //await generalStep.clickOnButton('Confirm'); //after mock response from payment system
            //await generalStep.expectPopUpNotificationIs('Your subscription has been canceled');
            //await generalStep.closePopUpNotification();
            //await generalStep.expectPageTitleIs('Subscription');
        });

        await test.step('The user can delete account', async () => {
            await settingsStep.expectDeleteAccountItemIsAvalable();
            await generalStep.clickOnButton('Delete');
            await generalStep.expectModalIsShown('Are you sure you want to delete your account?');
            await generalStep.expectTheButtonIsEnabled('Delete Account');
            await generalStep.clickOnButton('Keep My Account');// Todo Add test to cancel account
            await generalStep.expectModalIsNotShown('Are you sure you want to delete your account?');
        });

        await test.step('The user can keeps the current plan', async () => {
            await generalStep.expectButtonIsVisible('KEEP MY CURRENT PLAN');
            await generalStep.clickOnButton('KEEP MY CURRENT PLAN');
            await generalStep.expectPageTitleIs('Subscription');
            await generalStep.clickOnButton('Update My Plan');
            await generalStep.expectPageTitleIs('Subscription');
        });
    });
});

test.describe('When the user opens Usage page, the user can review plan and pricing', () => {

    let countEmailsVerified: string;
    let countWebsitesSearched: string;
    let totalCredits: string;
    let usedCredits: string;

    test('When the user opens Usage page, the user can review plan', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const loginStep = new LoginStep(page);
        const settingsStep = new SettingsStep(page);
        const emailVerificationStep = new VerifyEmailSearchStep(page);

        await test.step('Navigate to the application', async () => {
            await generalStep.open();
            await loginStep.login(resetPasswordTestData.email, resetPasswordTestData.password);
            await generalStep.expectPageTitleIs("Dashboard");
        });

        await test.step('Settings Auth menu is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Settings']);
        });

        await test.step('The Usage page is opened', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Usage');
            await generalStep.expectPageTitleIs('Usage');
        });

        // todo mock response from payment system
        await test.step('And The following items are shown', async () => {
            const currentCredits = await settingsStep.getCurrenCredits();
            totalCredits = currentCredits?.split(' ').pop()?.replace(/[^\d.]/g, '') || '';
            usedCredits = currentCredits?.split(' ')[0]?.match(/Used(\d+)/)?.[1] || '';
            countEmailsVerified = await settingsStep.getNumberByItem('Emails Verified') ?? '';
            countWebsitesSearched = await settingsStep.getNumberByItem('Websites Searched') ?? '';
            await settingsStep.expectCreditsInfoAre([`${usedCredits}`, 'Subscription Credit', ' Used']);
            await settingsStep.expectCreditsInfoAre(['Total Credits Remaining: ', `${totalCredits}`]);
            //I am going to use a new account every time in this test so the count will be 0
            await settingsStep.expectUsageSearchItemsAre(['Emails Verified', 'Websites Searched'], [countEmailsVerified, countWebsitesSearched]);
        });

        await test.step('When the user searchs the domain', async () => {
            await generalStep.clickOnBackToDashboard();
            await generalStep.expectPageTitleIs('Dashboard');
            await generalStep.clickOnMainMenuButton('Domain Discovery', 'Single Domain');
            await generalStep.expectPageTitleIs("Find Email Addresses & Insights");
            await generalStep.fillInEntity("https://thecatdoctor.co.uk/");
            await generalStep.clickOnButton('Search');
            await generalStep.expectPageTitleIs("Email Discovery Report");
            await generalStep.expectButtonIsVisible('Add to List');
            await generalStep.clickOnButton('Discover More');
            await generalStep.expectPageTitleIs("Find Email Addresses & Insights");
        });

        await test.step('And the user makes email verification', async () => {
            await generalStep.clickOnMainMenuButton('Email Verification', 'Single Email');
            await generalStep.expectPageTitleIs("Real-Time Email Verification");
            await generalStep.fillInEntity("jorwig@businessinsider.com");
            await generalStep.clickOnButton("Verify");
            await generalStep.expectPageTitleIs("Email Discovery Report");
            await emailVerificationStep.expectStatusIconIsVisible();
            await generalStep.clickOnButton('Verify More Emails');
            await generalStep.expectPageTitleIs("Real-Time Email Verification");
        });

        await test.step('Then the user can see the amount of credits and number discovered emails/domains', async () => {
            const currentEmailsCount = (parseInt(countEmailsVerified) + 1).toString();
            const currentDomainsCount = (parseInt(countWebsitesSearched) + 1).toString();
            const currentCredits = (parseInt(totalCredits) - 1.5).toString();
            const currentUsedCredits = (parseInt(usedCredits) + 1.5).toString();
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Settings']);
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Usage');
            await generalStep.expectPageTitleIs('Usage');

            // todo temporary account for testing
            //await settingsStep.expectUsageSearchItemsAre(['Emails Verified', 'Websites Searched'], [currentEmailsCount, currentDomainsCount]);
            //await settingsStep.expectCreditsInfoAre([`${currentUsedCredits}`, 'Subscription Credit', ' Used']);
            //await settingsStep.expectCreditsInfoAre(['Total Credits Remaining: ', `${currentCredits}`]);
        });

    });

    test('When the user opens Usage page, the user can review plan and pricing', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const settingsStep = new SettingsStep(page);
        const loginStep = new LoginStep(page);

        await test.step('Navigate to the application', async () => {
            await generalStep.open();
            await loginStep.login(resetPasswordTestData.email, resetPasswordTestData.password);
            await generalStep.expectPageTitleIs("Dashboard");
        });

        await test.step('Settings Auth menu is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Settings']);
        });

        await test.step('The Usage page is opened', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Usage');
            await generalStep.expectPageTitleIs('Usage');
        });
        await test.step('When the user click on \" Review your plan and pricing\" link', async () => {
            await settingsStep.clickOnPlanLink();
        });

        await test.step('Then the user is redirected to the Subscription page', async () => {
            await generalStep.expectPageTitleIs('Subscription');
        });
    });
});

test.describe('When the user opens Billing page, the Billing details are shown', () => {
    test('When the user opens Billing page, the user can review plan', async ({ page }) => {
        const generalStep = new GeneralStep(page);
        const loginStep = new LoginStep(page);
        const settingsStep = new SettingsStep(page);

        await test.step('Navigate to the application', async () => {
            await generalStep.open();
            await loginStep.login(logInData.username, logInData.password);
            await generalStep.expectPageTitleIs("Dashboard");
        });

        await test.step('Settings Auth menu is opened', async () => {
            await generalStep.openAuthMenu();
            await generalStep.expectAuthMenuItemsArePresented(['Settings']);
        });

        await test.step('When the user opens Usage page', async () => {
            await generalStep.clickOnSubAuthMenuButton('Settings', 'Billing');
            await generalStep.expectPageTitleIs('Billing');
        });

        // todo mock response from payment system
        await test.step('The following items are shown', async () => {
            await settingsStep.expectContentBlockAre(['Billing details', 'Payment method', 'Payment history']);
            await settingsStep.exepectBillingDetails(logInData.username);
            await settingsStep.expectPaymentMethodsAre(['Ending in ', 'Exp. ']);
            await settingsStep.expectPaymentHistoryGridWithFollowingColumnsIsVisible(['Date', 'Amount', 'Status', 'Receipt']);
            await settingsStep.expectValueOfRowEmailHistoryAre(1, ['Mon, Feb 24, 2025', '$50.00', 'Success']);
            await settingsStep.expectPaymentHistoryReceiptButtonIsVisible(1);
        });

        await test.step('When the user click on \" Reciept\" button, the user is redirected to the Receipt page', async () => {
            await settingsStep.clickOnReceiptButtonAndCheckUrl(page, 'https://pay.stripe.com/receipts/payment/', 1);
        });
    });
});