import { test } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { VerifyEmailSearchStep } from '../src/steps/verifyEmailSearchStep';

test("When the user bulk verifies emails verification, the verified emails are shown", async ({ page }) => {
    const generalStep = new GeneralStep(page);
    const loginStep = new LoginStep(page);
    const verifyEmailSearchStep = new VerifyEmailSearchStep(page);

    await test.step('Navigate to the application', async () => {
        await generalStep.open();
        await loginStep.login("test.prospectai@gmail.com", "Poma!2014");
        await generalStep.expectPageTitleIs("Dashboard");
    });

    await test.step('Open Bulk Emails Verification page', async () => {
        await generalStep.clickOnMainMenuButton('Email Verification', 'Bulk Check');
        await generalStep.expectCorrespondingUrl("/search#bulk");
    });

    await test.step('Fill in Search field with emails address', async () => {
        await verifyEmailSearchStep.fillInEmails("hrobertson@businessinsider.com\nkmcmahon@businessinsider.com");
        await verifyEmailSearchStep.clickOnVerifyButton("Verify");
    });

    await test.step('Expect corresponding title', async () => {
        await generalStep.expectPageTitleIs("Email Verification Report");
    });

    await test.step("Expect the corresponding emails are in the report list of emails", async () => {
        await verifyEmailSearchStep.expectEmailVerificationReportItems("hrobertson@businessinsider.com\nkmcmahon@businessinsider.com");
    });

    await test.step("Expect the email varification result modal window is open", async () => {
        await verifyEmailSearchStep.clickOnHiddenButtonEmailVerificationResult();
        await verifyEmailSearchStep.expectEmailVerificationResultModalIsOpen("hrobertson@businessinsider.com\nkmcmahon@businessinsider.com");
        await verifyEmailSearchStep.clickOnCloseModalButton();
    });

    await test.step("Click on Verify More Emails button to back to the previous page", async () => {
        await verifyEmailSearchStep.clickOnVerifyButton("Verify More Emails");
        await generalStep.expectPageTitleIs("Real-Time Email Verification");
    });
});