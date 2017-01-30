'use strict';

module.exports = {
  name: {
    mixin: 'input-text',
    validate: 'required'
  },
  'contact-name': {
    mixin: 'input-text',
    validate: 'required'
  },
  'contact-email': {
    mixin: 'input-text',
    validate: ['required', 'email']
  },
  'contact-phone': {
    mixin: 'input-text',
    validate: ['required', 'phonenumber']
  },
  'same-contact-address': {
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: ['yes', 'no']
  },
  'exhibit-postcode': {
    mixin: 'input-text-code',
    validate: ['required', 'postcode']
  },
  'exhibit-address-manual': {
    mixin: 'textarea',
    validate: 'required',
    'ignore-defaults': true,
    formatter: ['trim', 'hyphens'],
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'exhibit-address-lookup': {
    validate: 'required',
    className: 'address'
  },
  'exhibit-add-another-address': {
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    validate: 'required',
    options: [
      'yes',
      'no'
    ]
  },
};
