import { test } from '@playwright/test';
import { LoginStep } from '../src/steps/loginStep';
import { GeneralStep } from '../src/steps/generalStep';
import { SingleEmailFinderStep } from '../src/steps/singleEmailFinderStep';

test('When the user fill in all requered field with valid data then the email is found', async ({ page }) => {
    const loginStep = new LoginStep(page);
    const generalStep = new GeneralStep(page);
    const singleEmailFinderStep = new SingleEmailFinderStep(page);

    await test.step('Navigate to the application', async () => {
        await generalStep.open();
        await loginStep.login("test.prospectai@gmail.com", "Poma!2014");
        await generalStep.expectPageTitleIs("Dashboard");
    })

    await test.step('Open Single Email Finder page', async () => {
        await generalStep.clickOnMainMenuButton('Domain Discovery', 'Email Finder');
        await generalStep.expectPageTitleIs("Email Finder");
    })

    await test.step('Fill all required fields and clicks on Find Email button', async () => {
        await singleEmailFinderStep.fillInFirstName("kim");
        await singleEmailFinderStep.fillInLastName("kerr");
        await singleEmailFinderStep.fillInDomain("coastalpet.com");
        await singleEmailFinderStep.clickOnFindEmailButton();
        await generalStep.expectCorrespondingUrl("/result");
    });

    await test.step('Check the email is found', async () => {
        await generalStep.expectPageTitleIs("Email Finder");
        await singleEmailFinderStep.expectContactCardFullName("kim", "kerr", "coastalpet.com");
    });

    await test.step('Add email address to the list', async () => {
        await singleEmailFinderStep.clickOnAddToListButton();
        await generalStep.expectModalIsShown("Add to List");
        await singleEmailFinderStep.saveEmail();
    });

    await test.step('The email is saved', async () => {
        await generalStep.expectCorrespondingUrl("/success");
        await singleEmailFinderStep.expectContentTitle("Success");
    });

    await test.step('Click on Find Another Person button to come back to the previous page', async () => {
        await singleEmailFinderStep.clickOnFindAnotherPersonButton();
        await generalStep.expectCorrespondingUrl("/email-finder");
    });
});