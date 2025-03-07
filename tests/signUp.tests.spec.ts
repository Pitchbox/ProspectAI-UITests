import { test } from '@playwright/test';
import { GeneralStep } from '../src/steps/generalStep';
import { SignUpStep } from '../src/steps/signUpStep';

test("Create account", async ({ page }) => {
    const generalStep = new GeneralStep(page);
    const signUpStep = new SignUpStep(page);

    await generalStep.open();

    await test.step("Clicking on Create an account button on Sign in Page", async () => {
        await generalStep.clickOnActionButton("sign-up");
        await generalStep.expectCorrespondingUrl("/sign-up");
        await generalStep.expectPageTitleIs("Sign Up");
    })

    await test.step("Trying Sign Up with empty email field", async () => {
        await signUpStep.clickOnSignUpButton();
        await generalStep.expectValidationMessage("This field is required");
    })

    await test.step("Fill in unsupported simbols email and click on Sign Up", async () => {
        await signUpStep.fillEmail(".exam #$%^&*()@w3schools_com.");
        await signUpStep.clickOnSignUpButton();
        await generalStep.expectValidationMessage("Incorrect email format");
    })

    await test.step("Fill in email address with too short domain part and click on Sign Up", async () => {
        await signUpStep.fillEmail("qwerty@y.i");
        await signUpStep.clickOnSignUpButton();
        await generalStep.expectValidationMessage("Incorrect email format");
    })

    await test.step("Fill in correct email and click on Sign Up", async () => {
        await signUpStep.fillEmail("test@gmail.com");
        await signUpStep.clickOnSignUpButton();
        await generalStep.expectCorrespondingUrl("/verify-email");
        await generalStep.expectPageTitleIs("Verify Your Email");
    })

    await test.step("Click on Verify button while the email field is empty", async () => {
        await signUpStep.clickOnVerifyButton();
        await generalStep.expectValidationMessage("This field is required");
    });

    await test.step("Fill in incorrect confirmation email code and click on Verify button", async () => {
        await signUpStep.fillVerificationCode("123456789");
        await signUpStep.clickOnVerifyButton();
        await generalStep.expectValidationMessage("Invalid or expired email confirmation code");
    });
    //todo: add more steps
});

test("Click on Sign In button on Sign Up page", async ({ page }) => {
    const generalStep = new GeneralStep(page);
    await generalStep.open();
    //When the user clicks on the "Sign Up" button on Sign In page 
    await generalStep.clickOnActionButton("sign-up");
    await generalStep.expectCorrespondingUrl("/sign-up");
    await generalStep.clickOnActionButton("sign-in");
    // Then the user is redirected to the Sign In page
    await generalStep.expectCorrespondingUrl("/sign-in");
});