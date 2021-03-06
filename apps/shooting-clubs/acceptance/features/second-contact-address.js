'use strict';

const steps = require('../../');

Feature('Second Contact Address step');

Before((
  I,
  secondContactAddressPage
) => {
  I.visitPage(secondContactAddressPage, steps);
});

Scenario('The correct form elements are present on second-contact-postcode step', (
  I,
  secondContactAddressPage
) => {
  I.seeElement(secondContactAddressPage.fields.postcode);
});

Scenario('An error is shown if second-contact-postcode is not completed', (
  I,
  secondContactAddressPage
) => {
  I.submitForm();
  I.seeErrors(secondContactAddressPage.fields.postcode);
});

Scenario('I am taken to the second-contact-address-lookup step from postcode', (
  I,
  secondContactAddressPage
) => {
  secondContactAddressPage.fillFormAndSubmit(secondContactAddressPage.fields.postcode);
  I.seeInCurrentUrl(secondContactAddressPage['address-lookup-url']);
});

Scenario('I am taken to the second-contact-manual-address step when I click the link', (
  I,
  secondContactAddressPage
) => {
  I.click(secondContactAddressPage.links['manual-entry']);
  I.seeInCurrentUrl(secondContactAddressPage['address-url']);
});

Scenario('The correct form elements are present for second contact manual address step', (
  I,
  secondContactAddressPage
) => {
  I.click(secondContactAddressPage.links['manual-entry']);
  I.seeElements(secondContactAddressPage.fields['address-manual']);
});

Scenario('An error is shown if second contact manual address is not completed', (
  I,
  secondContactAddressPage
) => {
  I.click(secondContactAddressPage.links['manual-entry']);
  I.submitForm();
  I.seeErrors(secondContactAddressPage.fields['address-manual']);
});

Scenario('An error is shown if second-contact-address-lookup is not completed', (
  I,
  secondContactAddressPage
) => {
  secondContactAddressPage.fillFormAndSubmit(secondContactAddressPage.fields.postcode);
  I.submitForm();
  I.seeErrors(secondContactAddressPage.fields['address-lookup']);
});

Scenario('I am taken to the second contact manual address step if I cant find my address', (
  I,
  secondContactAddressPage
) => {
  secondContactAddressPage.fillFormAndSubmit(secondContactAddressPage.fields.postcode);
  I.click(secondContactAddressPage.links['cant-find-address']);
  I.seeInCurrentUrl(secondContactAddressPage['address-url']);
});

Scenario('When I click cant find my address link, I will see the postcode I entered in the second contact manual address step', (
  I,
  secondContactAddressPage
) => {
  secondContactAddressPage.fillFormAndSubmit(secondContactAddressPage.fields.postcode);
  I.click(secondContactAddressPage.links['cant-find-address']);
  I.see(secondContactAddressPage.content.postcode);
});

Scenario('I am taken to the second-contact-email step from the manual-address step', (
  I,
  secondContactAddressPage,
  secondContactEmailPage
) => {
  I.click(secondContactAddressPage.links['manual-entry']);
  secondContactAddressPage.fillFormAndSubmit(secondContactAddressPage.fields['address-manual']);
  I.seeInCurrentUrl(secondContactEmailPage.url);
});

Scenario('When an address is selected I am taken to the second-contact-email step', (
  I,
  secondContactAddressPage,
  secondContactEmailPage
) => {
  secondContactAddressPage.selectAddressAndSubmit();
  I.seeInCurrentUrl(secondContactEmailPage.url);
});
