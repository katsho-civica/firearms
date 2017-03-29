'use strict';

module.exports = {
  name: 'supporting-documents',
  baseUrl: '/supporting-documents',
  params: '/:action?/:id?',
  steps: {
    '/reference': {
      fields: [
        'reference-number'
      ],
      next: '/supporting-documents'
    },
    '/supporting-documents': {
      controller: require('../common/controllers/supporting-documents'),
      fields: [
        'supporting-document-upload',
        'supporting-document-description'
      ],
      continueOnEdit: true,
      next: '/supporting-documents-add'
    },
    '/supporting-documents-add': {
      controller: require('../common/controllers/supporting-documents-add-another'),
      behaviours: [require('./behaviours/supporting-documents-add')],
      fields: [
        'supporting-document-add-another'
      ],
      forks: [{
        isLoop: true,
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
      controller: require('hof-confirm-controller'),
      behaviours: ['complete'],
      next: '/confirmation',
      sections: {
        reference: ['reference-number'],
        documents: [
          {
            field: 'supporting-documents',
            parse: list => list.map(a => a.description).join('\n'),
            step: '/supporting-documents-add'
          }
        ]
      }
    },
    '/confirmation': {
      backLink: false
    }
  }
};