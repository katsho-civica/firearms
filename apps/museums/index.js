'use strict';

const controllers = require('hof-controllers');

module.exports = {
  name: 'museums',
  baseUrl: '/museums',
  params: '/:action?/:id?',
  steps: {
    '/': {
      controller: controllers.start,
      next: '/activity'
    },
    '/activity': {
      fields: ['activity'],
      next: '/name'
    },
    '/name': {
      fields: ['name'],
      next: '/exhibit-postcode',
      locals: {
        section: 'name'
      }
    },
    '/exhibit-postcode': {
      addressKey: 'exhibitAddresses',
      template: 'postcode-loop.html',
      controller: require('../common/controllers/postcode-loop'),
      fields: [
        'exhibit-postcode'
      ],
      next: '/exhibit-address',
      backlink: 'name',
      forks: [{
        target: '/exhibit-address-lookup',
        condition(req) {
          const addresses = req.sessionModel.get('exhibit-addresses');
          return addresses && addresses.length;
        }
      }],
      locals: {
        field: 'exhibit'
      }
    },
    '/exhibit-address': {
      addressKey: 'exhibitAddresses',
      template: 'address-loop.html',
      controller: require('../common/controllers/address-loop'),
      fields: [
        'exhibit-address-manual'
      ],
      next: '/exhibit-add-another-address',
      prereqs: ['/exhibit-postcode', '/name'],
      backlink: 'exhibit-postcode',
      locals: {
        field: 'exhibit'
      }
    },
    '/exhibit-add-another-address': {
      addressKey: 'exhibitAddresses',
      template: 'add-another-address-loop.html',
      controller: require('../common/controllers/add-another-address-loop'),
      fields: [
        'exhibit-add-another-address'
      ],
      prereqs: ['/name'],
      next: '/contact-name',
      forks: [{
        target: '/exhibit-postcode',
        condition: {
          field: 'exhibit-add-another-address',
          value: 'yes'
        }
      }],
      locals: {
        field: 'exhibit'
      }
    },
    '/contact-name': {
      fields: ['contact-name'],
      next: '/contact-details',
      locals: {
        section: 'contact-details'
      }
    },
    '/contact-details': {
      fields: ['contact-email', 'contact-phone'],
      next: '/contact-address',
      locals: {
        section: 'contact-details'
      }
    },
    '/contact-address': {
      fields: ['same-contact-address'],
      next: '/contact-address-select',
      forks: [{
        target: '/contact-address-postcode',
        condition: {
          field: 'same-contact-address',
          value: 'no'
        }
      }]
    },
    '/contact-address-postcode': {
      next: '/contact-address-select'
    },
    '/contact-address-select': {
      next: '/confirm'
    },
    '/confirm': {
      template: 'confirm',
      controller: require('./controllers/confirm'),
      fieldsConfig: require('./fields'),
      next: '/confirmation'
    },
    '/confirmation': {
      clearSession: true,
      backLink: false
    }
  }
};
