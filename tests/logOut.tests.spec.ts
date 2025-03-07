import { test } from '@playwright/test';
import { GeneralStep } from '../src/steps/generalStep';
import { LoginStep } from '../src/steps/loginStep';
import { logInData } from '../src/helpers/TestConstants';

test.beforeEach(async ({ page }) => {
    const loginStep = new LoginStep(page);
    const generalStep = new GeneralStep(page);

    await generalStep.open();
    await loginStep.login(logInData.username, logInData.password);
    await generalStep.expectPageTitleIs("Dashboard");
});

test('When the user logs out, the user is redirected to the login page', async ({ page }) => {
    const generalStep = new GeneralStep(page);

    await test.step('When the user logs out', async () => {
        await generalStep.openAuthMenu();
        await generalStep.expectAuthMenuItemsArePresented(['Logout']);
        await generalStep.clickOnSubAuthMenuButton('Logout');
    });

    await test.step('The user is redirected to the login page', async () => {
        await generalStep.expectPageTitleIs("Sign in to your account");
        await generalStep.expectCorrespondingUrl(logInData.url);
    });
});