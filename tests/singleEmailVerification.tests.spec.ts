import { test } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { VerifyEmailSearchStep } from '../src/steps/verifyEmailSearchStep';

test("Single email verification flow", async ({ page }) => {
    const generalStep = new GeneralStep(page);
    const loginStep = new LoginStep(page);
    const verifyEmailSearchStep = new VerifyEmailSearchStep(page);

    const username = "test.prospectai@gmail.com";
    const password = "Poma!2014";

    await test.step("Navigate to the application", async () => {
        await generalStep.open();
        await loginStep.login(username, password);
        await generalStep.expectPageTitleIs("Dashboard");
    });

    await test.step("Open Real-Time Email Verification page", async () => {
        await generalStep.clickOnMainMenuButton('Email Verification', 'Single Email');
        await generalStep.expectPageTitleIs("Real-Time Email Verification");
    });

    await test.step("Fill in email and click on Verify button", async () => {
        await verifyEmailSearchStep.fillInEmail("jorwig@businessinsider.com");
        await verifyEmailSearchStep.clickOnVerifyButton("Verify");
        await generalStep.expectPageTitleIs("Email Discovery Report");
    });

    await test.step("Check the result", async () => {
        await verifyEmailSearchStep.expectHeaderEmailDiscoveryReport("jorwig@businessinsider.com");
    });

    await test.step("Click on Verify More Emails button to back to the previous page", async () => {
        await verifyEmailSearchStep.clickOnVerifyButton("Verify More Emails");
        await generalStep.expectPageTitleIs("Real-Time Email Verification");
    });
});