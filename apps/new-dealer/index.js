'use strict';

const _ = require('lodash');
const controllers = require('hof-controllers');
const path = require('path');
const config = require('../../config');

const ammunition = req => _.includes(req.sessionModel.get('weapons-ammunition'), 'ammunition');
const weapons = req => _.includes(req.sessionModel.get('weapons-ammunition'), 'weapons');
const storedOnPremises = req => req.sessionModel.get('stored-on-premises') === 'true';

const Submission = require('../common/behaviours/casework-submission');
const submission = Submission({
  prepare: require('./models/submission')
});

const pdf = require('../common/behaviours/pdf-upload');

const Emailer = require('../common/behaviours/emailer');
const emailer = Emailer({
  template: path.resolve(__dirname, './emails/confirm.html'),
  recipient: 'contact-email',
  subject: data => `Ref: ${data.caseid} - Section 5 firearms licence application`,
  type: 'Section 5 authority',
  nameKey: data => {
    const contact = data['contact-holder'];
    return contact === 'other' ? 'someone-else-name' : `${contact}-authority-holders-name`;
  }
});

module.exports = {
  name: 'new-dealer',
  baseUrl: '/s5',
  params: '/:action?/:id?',
  steps: {
    '/activity': {
      fields: [
        'activity'
      ],
      next: '/company-name',
      forks: [{
        target: '/authority-number-renew-vary',
        condition: {
          field: 'activity',
          value: 'renew'
        }
      }]
    },
    '/authority-number-renew-vary': {
      fields: [
        'reference-number',
        'authority-number'
      ],
      next: '/company-name',
      locals: {
        section: 'business-details'
      }
    },
    '/company-name': {
      fields: [
        'organisation',
        'company-name',
        'company-house-number',
        'sole-trader-name',
        'shooting-club-name',
        'charity-name',
        'charity-number',
        'museum-name',
        'other-name'
      ],
      next: '/handle',
      locals: {
        section: 'business-details'
      }
    },
    '/handle': {
      fields: [
        'weapons-ammunition'
      ],
      next: '/obtain',
      locals: {
        renew: true,
        section: 'authority-details',
        step: 'handle'
      }
    },
    '/obtain': {
      fields: [
        'obtain',
        'other-means-details'
      ],
      next: '/import',
      locals: {
        renew: true,
        section: 'authority-details',
        step: 'obtain'
      }
    },
    '/import': {
      fields: [
        'import',
        'import-country'
      ],
      next: '/storage',
      locals: {
        renew: true,
        section: 'authority-details',
        step: 'import'
      }
    },
    '/storage': {
      fields: [
        'stored-on-premises',
        'no-storage-details'
      ],
      next: '/usage',
      forks: [{
        target: '/storage-postcode',
        condition(req) {
          return storedOnPremises(req);
        }
      }],
      locals: {
        renew: true,
        step: 'storage'
      }
    },
    '/storage-postcode': {
      addressKey: 'storageAddresses',
      template: 'storage-address',
      controller: require('../common/controllers/postcode'),
      fields: [
        'storage-postcode'
      ],
      backLinks: '/storage',
      next: '/storage-address',
      continueOnEdit: true,
      forks: [{
        target: '/storage-address-lookup',
        condition(req) {
          const addresses = req.sessionModel.get('storage-addresses');
          return addresses && addresses.length;
        }
      }],
      locals: {
        section: 'storage-postcode',
        field: 'storage',
        renew: true,
        step: 'storage-postcode'
      }
    },
    '/storage-address-lookup': {
      addressKey: 'storageAddresses',
      template: 'storage-address-lookup',
      controller: require('../common/controllers/address-lookup-loop'),
      fields: [
        'storage-address-lookup'
      ],
      next: '/storage-add-another-address',
      continueOnEdit: true,
      locals: {
        renew: true,
        field: 'storage',
        step: 'storage-address-lookup'
      }
    },
    '/storage-address': {
      addressKey: 'storageAddresses',
      template: 'storage-address-manual',
      controller: require('../common/controllers/address-loop'),
      fields: [
        'storage-address-manual'
      ],
      prereqs: ['/storage-postcode', '/storage'],
      backLink: 'storage-postcode',
      next: '/storage-add-another-address',
      continueOnEdit: true,
      locals: {
        field: 'storage',
        renew: true,
        step: 'storage-address'
      }
    },
    '/storage-add-another-address': {
      addressKey: 'storageAddresses',
      template: 'add-another-address-loop.html',
      controller: require('../common/controllers/add-another-address-loop'),
      behaviours: require('../common/behaviours/delete-address'),
      fields: [
        'storage-add-another-address'
      ],
      prereqs: ['/storage'],
      next: '/usage',
      forks: [{
        target: '/storage-postcode',
        continueOnEdit: true,
        condition: {
          field: 'storage-add-another-address',
          value: 'yes'
        }
      }],
      locals: {
        section: 'storage-add-another-address',
        field: 'storage',
        renew: true,
        step: 'storage-add-another-address'
      }
    },
    '/usage': {
      fields: [
        'usage',
        'other-details'
      ],
      next: '/ammunition',
      forks: [{
        target: '/weapons',
        condition: weapons
      }],
      locals: {
        renew: true,
        section: 'authority-details',
        step: 'usage'
      }
    },
    '/weapons': {
      template: 'weapons-ammunition.html',
      fields: [
        'weapons-types',
        'weapons-unspecified-details',
        'fully-automatic-quantity',
        'self-loading-quantity',
        'short-pistols-quantity',
        'short-self-loading-quantity',
        'large-revolvers-quantity',
        'rocket-launchers-quantity',
        'air-rifles-quantity',
        'fire-noxious-substance-quantity',
        'disguised-firearms-quantity',
        'military-use-rockets-quantity',
        'projecting-launchers-quantity'
      ],
      next: '/authority-holders',
      forks: [{
        target: '/ammunition',
        condition: ammunition
      }],
      locals: {
        weaponsOrAmmunition: 'weapons'
      }
    },
    '/ammunition': {
      template: 'weapons-ammunition.html',
      fields: [
        'ammunition-types',
        'ammunition-unspecified-details',
        'explosive-cartridges-quantity',
        'incendiary-missile-quantity',
        'armour-piercing-quantity',
        'expanding-missile-quantity',
        'missiles-for-above-quantity'
      ],
      next: '/authority-holders',
      locals: {
        weaponsOrAmmunition: 'ammunition'
      }
    },
    '/authority-holders': {
      fields: [
        'authority-holders'
      ],
      next: '/first-authority-holders-name',
      locals: {
        renew: true,
        step: 'authority-holders'
      }
    },
    '/first-authority-holders-name': {
      fields: [
        'first-authority-holders-name'
      ],
      next: '/first-authority-holders-birth',
      locals: {
        section: 'first-authority-holder'
      }
    },
    '/first-authority-holders-birth': {
      controller: controllers.date,
      dateKey: 'first-authority-dob',
      fields: [
        'first-authority-dob',
        'first-authority-dob-day',
        'first-authority-dob-month',
        'first-authority-dob-year',
        'first-authority-town-birth',
        'first-authority-country-birth'
      ],
      next: '/first-authority-holders-nationality',
      locals: {
        section: 'first-authority-holder'
      }
    },
    '/first-authority-holders-nationality': {
      template: 'authority-holders-nationality.html',
      controller: require('./controllers/authority-holders-nationality'),
      fields: [
        'first-authority-holders-nationality',
        'first-authority-holders-nationality-multi',
        'first-authority-holders-nationality-second',
        'first-authority-holders-nationality-third'
      ],
      next: '/first-authority-holders-postcode',
      locals: {
        key: 'first-authority-holders-nationality',
        section: 'first-authority-holder'
      }
    },
    '/first-authority-holders-postcode': {
      template: 'postcode.html',
      controller: require('../common/controllers/postcode'),
      fields: [
        'first-authority-holders-postcode'
      ],
      next: '/first-authority-holders-address',
      forks: [{
        target: '/first-authority-holders-address-lookup',
        condition(req) {
          const addresses = req.sessionModel.get('first-authority-holders-addresses');
          return addresses && addresses.length;
        }
      }],
      locals: {
        field: 'first-authority-holders'
      }
    },
    '/first-authority-holders-address-lookup': {
      template: 'address-lookup.html',
      controller: require('../common/controllers/address-lookup'),
      fields: [
        'first-authority-holders-address-lookup'
      ],
      next: '/contact',
      forks: [{
        target: '/second-authority-holders-name',
        condition(req) {
          return req.sessionModel.get('authority-holders') === 'two';
        }
      }],
      locals: {
        field: 'first-authority-holders',
        section: 'first-authority-holder'
      }
    },
    '/first-authority-holders-address': {
      template: 'address.html',
      controller: require('../common/controllers/address'),
      fields: [
        'first-authority-holders-address-manual'
      ],
      next: '/contact',
      prereqs: ['/first-authority-holders-postcode', '/first-authority-holders-nationality'],
      backLink: 'first-authority-holders-postcode',
      forks: [{
        target: '/second-authority-holders-name',
        condition(req) {
          return req.sessionModel.get('authority-holders') === 'two';
        }
      }],
      locals: {
        field: 'first-authority-holders',
        section: 'first-authority-holder'
      }
    },
    '/second-authority-holders-name': {
      fields: [
        'second-authority-holders-name'
      ],
      next: '/second-authority-holders-birth',
      locals: {
        section: 'second-authority-holder'
      }
    },
    '/second-authority-holders-birth': {
      controller: controllers.date,
      dateKey: 'second-authority-dob',
      fields: [
        'second-authority-dob',
        'second-authority-dob-day',
        'second-authority-dob-month',
        'second-authority-dob-year',
        'second-authority-town-birth',
        'second-authority-country-birth'
      ],
      next: '/second-authority-holders-nationality',
      locals: {
        section: 'second-authority-holder'
      }
    },
    '/second-authority-holders-nationality': {
      template: 'authority-holders-nationality.html',
      controller: require('./controllers/authority-holders-nationality'),
      fields: [
        'second-authority-holders-nationality',
        'second-authority-holders-nationality-multi',
        'second-authority-holders-nationality-second',
        'second-authority-holders-nationality-third',
      ],
      next: '/second-authority-holders-postcode',
      locals: {
        key: 'second-authority-holders-nationality',
        section: 'second-authority-holder'
      }
    },
    '/second-authority-holders-postcode': {
      template: 'postcode.html',
      controller: require('../common/controllers/postcode'),
      fields: [
        'second-authority-holders-postcode'
      ],
      next: '/second-authority-holders-address',
      forks: [{
        target: '/second-authority-holders-address-lookup',
        condition(req) {
          const addresses = req.sessionModel.get('second-authority-holders-addresses');
          return addresses && addresses.length;
        }
      }],
      locals: {
        field: 'second-authority-holders'
      }
    },
    '/second-authority-holders-address-lookup': {
      template: 'address-lookup.html',
      controller: require('../common/controllers/address-lookup'),
      fields: [
        'second-authority-holders-address-lookup'
      ],
      next: '/contact',
      locals: {
        field: 'second-authority-holders',
        section: 'second-authority-holder'
      }
    },
    '/second-authority-holders-address': {
      template: 'address.html',
      controller: require('../common/controllers/address'),
      fields: [
        'second-authority-holders-address-manual'
      ],
      next: '/contact',
      prereqs: ['/second-authority-holders-postcode', '/second-authority-holders-nationality'],
      backLink: 'second-authority-holders-postcode',
      locals: {
        field: 'second-authority-holders',
        section: 'second-authority-holder'
      }
    },
    '/contact': {
      fields: [
        'contact-holder',
        'someone-else-name'
      ],
      controller: require('./controllers/contact'),
      next: '/contact-details',
      locals: {
        renew: true,
        section: 'contacts-details',
        step: 'contact'
      },
      continueOnEdit: true
    },
    '/contact-details': {
      fields: [
        'contact-email',
        'contact-phone'
      ],
      next: '/authority-holder-contact-postcode',
      forks: [{
        target: '/contact-postcode',
        condition(req) {
          return req.sessionModel.get('contact-holder') === 'other';
        }
      }],
      locals: {
        section: 'contacts-details'
      }
    },
    '/authority-holder-contact-postcode': {
      controller: require('../common/controllers/postcode'),
      fields: [
        'use-different-address',
        'authority-holder-contact-postcode'
      ],
      next: '/authority-holder-contact-address',
      forks: [{
        target: '/supporting-documents-add',
        condition: {
          field: 'use-different-address',
          value: 'false'
        }
      }, {
        target: '/authority-holder-contact-address-lookup',
        condition(req) {
          const addresses = req.sessionModel.get('authority-holder-contact-addresses');
          return addresses && addresses.length;
        }
      }],
      locals: {
        field: 'authority-holder-contact',
        section: 'contacts-details'
      }
    },
    '/authority-holder-contact-address-lookup': {
      template: 'address-lookup.html',
      controller: require('../common/controllers/address-lookup'),
      fields: [
        'authority-holder-contact-address-lookup'
      ],
      next: '/supporting-documents-add',
      locals: {
        field: 'authority-holder-contact',
        section: 'contacts-details'
      }
    },
    '/authority-holder-contact-address': {
      template: 'address.html',
      controller: require('../common/controllers/address'),
      fields: [
        'authority-holder-contact-address-manual'
      ],
      next: '/supporting-documents-add',
      prereqs: ['/authority-holder-contact-postcode', '/contact-details'],
      backLink: 'authority-holder-contact-postcode',
      locals: {
        field: 'authority-holder-contact',
        section: 'contacts-details'
      }
    },
    '/contact-postcode': {
      template: 'postcode.html',
      controller: require('../common/controllers/postcode'),
      fields: [
        'contact-postcode'
      ],
      next: '/contact-address',
      forks: [{
        target: '/contact-address-lookup',
        condition(req) {
          const addresses = req.sessionModel.get('contact-addresses');
          return addresses && addresses.length;
        }
      }],
      locals: {
        field: 'contact',
        section: 'contacts-details'
      }
    },
    '/contact-address-lookup': {
      template: 'address-lookup.html',
      controller: require('../common/controllers/address-lookup'),
      fields: [
        'contact-address-lookup'
      ],
      next: '/supporting-documents-add',
      locals: {
        field: 'contact',
        section: 'contacts-details'
      }
    },
    '/contact-address': {
      template: 'address.html',
      controller: require('../common/controllers/address'),
      fields: [
        'contact-address-manual'
      ],
      next: '/supporting-documents-add',
      prereqs: ['/contact-postcode', '/contact-details'],
      backLink: 'contact-postcode',
      locals: {
        field: 'contact',
        section: 'contacts-details'
      }
    },
    '/supporting-documents-add': {
      fields: [
        'supporting-document-add'
      ],
      forks: [{
        target: '/supporting-documents',
        condition: {
          field: 'supporting-document-add',
          value: 'yes'
        }
      }],
      next: '/confirm'
    },
    '/supporting-documents': {
      controller: require('../common/controllers/supporting-documents'),
      fields: [
        'supporting-document-upload',
        'supporting-document-description'
      ],
      continueOnEdit: true,
      next: '/supporting-documents-add-another'
    },
    '/supporting-documents-add-another': {
      controller: require('../common/controllers/supporting-documents-add-another'),
      fields: [
        'supporting-document-add-another'
      ],
      forks: [{
        target: '/supporting-documents',
        condition: {
          field: 'supporting-document-add-another',
          value: 'yes'
        }
      }],
      continueOnEdit: true,
      next: '/confirm'
    },
    '/confirm': {
      controller: require('./controllers/confirm'),
      fieldsConfig: require('./fields'),
      behaviours: [pdf],
      next: '/declaration'
    },
    '/declaration': {
      template: 'declaration',
      behaviours: ['complete', submission, emailer],
      next: '/confirmation'
    },
    '/confirmation': {
      locals: {
        'survey-url': config.survey.urls['new-dealer']
      },
      backLink: false
    }
  }
};
