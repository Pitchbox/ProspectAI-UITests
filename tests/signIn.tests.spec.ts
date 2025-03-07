import { test } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { logInData } from '../src/helpers/TestConstants';

test('Login to the application with credentials', async ({ page }) => {
    const loginStep = new LoginStep(page);
    const generalStep = new GeneralStep(page);

    await test.step('Open the login page', async () => {
        await generalStep.open();
        await generalStep.expectPageTitleIs("Sign in to your account");
        await generalStep.expectCorrespondingUrl(logInData.url);
    })

    await test.step('Check if password field is invisible', async () => {
        await loginStep.fillUsername("qwerty");
        await loginStep.fillPassword("qwerty");
        await loginStep.expectPasswordIs("Invisible", "password");//expect password is invisible
        await loginStep.clickVisibilityIcon();
        await loginStep.expectPasswordIs("Visible", "text");//expect password is visible
    });

    await test.step('Login with empty user name field', async () => {
        //When the user logs in with empty user name field
        await loginStep.login("", "qwerty");
        await generalStep.expectValidationMessage("This field is required");
    })

    await test.step('Login with empty password field', async () => {
        //When the user logs in with empty password field then the error message is displayed
        await loginStep.login("test.prospectai@gmail.com", "");
        await generalStep.expectValidationMessage("This field is required");
    })

    await test.step('Login with invalid user name', async () => {
        //When the user logs in with invalid user name then the error message is displayed under the field
        await loginStep.login("prospectai@gmail.com", "Poma!2014");
        await generalStep.expectValidationMessage("Check authentication credentials");
    })

    await test.step('Login with invalid password', async () => {
        //When the user logs in with invalid password then the error message is displayed under the field
        await loginStep.login("test.prospectai@gmail.com", "QWerty!2014");
        await generalStep.expectValidationMessage("Check authentication credentials");
    })

    await test.step('Login with incorrect email format', async () => {
        //When the user logs in with incorrect email format the error message is displayed under the field
        await loginStep.login("test.prospectaigmailcom", "erty2014");
        await generalStep.expectValidationMessage("Incorrect email format");
    })

    await test.step('Login with valid credentials', async () => {
        //When the user logs in with valid credentials the user is redirected to the ProspectAi.com
        await loginStep.login("test.prospectai@gmail.com", "Poma!2014");
        await generalStep.expectPageTitleIs("Dashboard");
    })
});

test.describe('Login to the application with social media', () => {

    test('Login with Google', async ({ page }) => {
        const loginStep = new LoginStep(page);
        const generalStep = new GeneralStep(page);

        await generalStep.open();
        await generalStep.expectPageTitleIs("Sign in to your account");
        //When the user clicks on the "Sign in with Google" button
        await loginStep.logInWith("google");
        await generalStep.expectCorrespondingUrl('//accounts.google.com/**')
        //Then the user is redirected to the Google login page
        await loginStep.expectToBeOpenedLogInWithGooglePage();
        //todo: add the rest of the steps
    })

    test('Login with LinkedIn', async ({ page }) => {
        const loginStep = new LoginStep(page);
        const generalStep = new GeneralStep(page);

        await generalStep.open();
        //When the user clicks on the "Sign in with LinkedIn" button
        await loginStep.logInWith("linkedin");
        await generalStep.expectCorrespondingUrl('//www.linkedin.com/**');
        //Then the user is redirected to the LinkedIn login page
    })

    test('Login with Pitchbox', async ({ page }) => {
        const loginStep = new LoginStep(page);
        const generalStep = new GeneralStep(page);

        await generalStep.open();
        //When the user clicks on the "Sign in with Pitchbox" button
        await loginStep.logInWith("pitchbox");
        //Then the user is redirected to the Pitchbox login page
        await generalStep.expectCorrespondingUrl('//welcome.pitchboxlabs.com/**');
        await loginStep.expectToBeOpenedLogInWithPitchboxPage();
        //todo: add the rest of the steps
    })
});