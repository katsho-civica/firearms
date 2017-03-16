'use strict';

const _ = require('lodash');
const controllers = require('hof-controllers').confirm;

module.exports = class ConfirmController extends controllers {

  locals(req, res) {
    const content = req.rawTranslate('pages.confirm');
    const locals = super.locals(req, res);
    const rows = locals.rows.filter(row => row.fields === undefined || row.fields.length);
    return Object.assign({}, locals, {
      content,
      rows
    });
  }

  formatData(data, translate) {
    const result = super.formatData(data, translate);
    const address = this.addAddressLoopSection(data, translate);
    result.splice(2, 0, address);

    const weapons = this.getWeaponsAmmunitionQuantity(data, translate, 'weapons');
    result.splice(3, 0, weapons);

    const ammo = this.getWeaponsAmmunitionQuantity(data, translate, 'ammunition');
    result.splice(4, 0, ammo);

    return this.addContactDetailsSection(data, translate, result.filter(a => a));
  }

  saveValues(req, res, callback) {
    // prevents calling email code from hof-controllers
    callback();
  }

  addAddressLoopSection(data, translate) {
    let addresses = data.storageAddresses;
    if (addresses !== undefined) {
      addresses = _.map(_.values(addresses), 'address');
      const items = addresses.map(value => ({
        fields: [{
          value,
          field: 'storage-address'
        }]
      }));
      const section = {
        items,
        section: translate('pages.storage-address.summary'),
        hasMultipleFields: true,
        step: 'storage-add-another-address'
      };
      return section;
    }
  }

  getWeaponsAmmunitionQuantity(data, translate, key) {
    let types = data[`${key}-types`];
    let section;
    if (types !== undefined && types !== 'unspecified') {
      types = _.castArray(types);
      const items = types.map(value => ({
        fields: [{
          value: data[`${value}-quantity`],
          field: 'quantity-base'
        }, {
          value: translate(`fields.${key}-types.options.${value}.label`),
          field: `${key}-types`
        }]
      }));
      const headers = items[0].fields.map(item => {
        return translate(`fields.${item.field}.summary`);
      });
      section = {
        items,
        headers,
        section: translate(`pages.${key}.summary`),
        hasMultipleFields: true,
        step: key,
        moreThanOneField: items[0].fields.length > 1
      };
    } else if (types === 'unspecified') {
      const items = {
        fields: [{
          value: translate(`fields.${key}-types.options.${types}.label`),
          field: `${key}-types`
        }, {
          value: data[`${key}-unspecified-details`],
          field: 'further-details'
        }]
      };
      const headers = items.fields.map(item => {
        return translate(`fields.${item.field}.summary`);
      });
      section = {
        items,
        headers,
        section: translate(`pages.${key}.summary`),
        hasMultipleFields: true,
        step: key,
        moreThanOneField: items.fields.length > 1
      };
    }
    return section;
  }

  getContactHoldersName(data) {
    const contactHolder = data['contact-holder'];
    const contactName = contactHolder === 'first' || contactHolder === 'second' ?
      data[`${contactHolder}-authority-holders-name`] :
      data['someone-else-name'];
    return contactName;
  }

  addContactDetailsSection(data, translate, result) {
    const contactHolder = data['contact-holder'];
    const contactName = this.getContactHoldersName(data);
    const key = `${contactHolder}-authority-holders-address`;
    const contactAddress = data[`${key}-manual`] || data[`${key}-lookup`];
    return result.map(section => {
      if (section.fields !== undefined) {
        section.fields = section.fields.map(field => {
          if (field.field === 'contact-holder') {
            field.value = contactName;
          } else if (field.field === 'use-different-address') {
            field.label = translate('fields.authority-holder-contact-address-manual.summary');
            field.value = contactAddress;
          }
          return field;
        });
      }
      return section;
    });
  }

};
