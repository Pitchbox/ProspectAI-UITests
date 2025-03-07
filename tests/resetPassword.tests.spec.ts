import { test } from '@playwright/test';
import { ResetPasswordStep } from '../src/steps/resetPasswordStep';
import { GeneralStep } from '../src/steps/generalStep';

test('Reset password', async ({ page }) => {
    const generalStep = new GeneralStep(page);
    const resetPasswordStep = new ResetPasswordStep(page);

    await generalStep.open();

    await test.step('When the user clicks on the "Reset password" button then the user is redirected to the reset password page', async () => {
        await generalStep.clickOnActionButton("reset-password");
        await generalStep.expectCorrespondingUrl("/reset-password");
        await resetPasswordStep.expectToBeOpenedResetPasswordPage();
    })

    await test.step('And the user enters the email and clicks on the "Reset password" button then the reset password window is open', async () => {
        await generalStep.expectCorrespondingUrl("//app.prospectailabs.com/reset-password**");
        await generalStep.fillInTheInput("Email", "test.prospectai@gmail.com");
        await generalStep.expectTheButtonIsDisabled('Reset Password');
        //todo how to bypass captcha
        //await generalStep.clickOnButton('Reset Password');
    })
});