'use strict';

const path = require('path');

const commonPagesPath = page => path.resolve(__dirname,
  `./apps/common/acceptance/pages/${page}`);

const dealerPagesPath = page => path.resolve(__dirname,
  `./apps/new-dealer/acceptance/pages/${page}`);

const shootingClubPagesPath = page => path.resolve(__dirname,
  `./apps/shooting-clubs/acceptance/pages/${page}`);

module.exports = {
  name: 'firearms',
  tests: './apps/**/acceptance/features/*.js',
  include: {
    activityPage: commonPagesPath('activity.js'),
    authorityNumberRenewPage: dealerPagesPath('authority-holder-renew-vary.js'),
    companyNamePage: dealerPagesPath('company-name.js'),
    handlePage: dealerPagesPath('handle.js'),
    obtainPage: dealerPagesPath('obtain.js'),
    importPage: dealerPagesPath('import.js'),
    storagePage: dealerPagesPath('storage.js'),
    usagePage: dealerPagesPath('usage.js'),
    weaponsPage: dealerPagesPath('weapons.js'),
    ammunitionsPage: dealerPagesPath('ammunition.js'),
    authorityHoldersPage: dealerPagesPath('authority-holders.js'),
    firstAuthorityHoldersNamePage: dealerPagesPath('first-authority-holders-name.js'),
    firstAuthorityHoldersBirthPage: dealerPagesPath('first-authority-holders-birth.js'),
    firstAuthorityHoldersNationalityPage: dealerPagesPath('first-authority-holders-nationality.js'),
    firstAuthorityHoldersAddressPage: dealerPagesPath('first-authority-holders-address.js'),
    secondAuthorityHoldersNamePage: dealerPagesPath('second-authority-holders-name.js'),
    secondAuthorityHoldersBirthPage: dealerPagesPath('second-authority-holders-birth.js'),
    secondAuthorityHoldersNationalityPage: dealerPagesPath('second-authority-holders-nationality.js'),
    secondAuthorityHoldersAddressPage: dealerPagesPath('second-authority-holders-address.js'),
    storageAddressPage: dealerPagesPath('storage-address.js'),
    contactPage: dealerPagesPath('contact.js'),
    contactDetailsPage: dealerPagesPath('contact-details.js'),
    contactAddressPage: dealerPagesPath('contact-address.js'),
    contactAddressAuthorityHolderPage: dealerPagesPath('contact-address-authority-holder.js'),
    confirmPage: dealerPagesPath('confirm.js'),
    confirmationPage: dealerPagesPath('confirmation.js'),
    authorityDetailsPage: shootingClubPagesPath('authority-details'),
    clubNamePage: shootingClubPagesPath('club-name.js'),
    clubAddressPage: shootingClubPagesPath('club-address.js'),
    clubSecretaryPage: shootingClubPagesPath('club-secretary-name'),
    clubSecretaryAddressPage: shootingClubPagesPath('club-secretary-address'),
    clubSecretaryEmailPage: shootingClubPagesPath('club-secretary-email'),
    secondContactNamePage: shootingClubPagesPath('second-contact-name'),
    secondContactAddressPage: shootingClubPagesPath('second-contact-address'),
    secondContactEmailPage: shootingClubPagesPath('second-contact-email'),
    locationAddressPage: shootingClubPagesPath('location-address'),
    clubsStorageAddressPage: shootingClubPagesPath('storage-address-list.js')
  }
};
