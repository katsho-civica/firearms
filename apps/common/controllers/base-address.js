'use strict';

const BaseController = require('./base');
const _ = require('lodash');

module.exports = class BaseAddressController extends BaseController {

  locals(req, res) {
    const locals = super.locals(req, res);
    let addresses = this.getAddresses(req);
    const hasAddresses = !!_.size(addresses);
    const hasCategories = this.hasCategories(hasAddresses, addresses);
    if (this.options.addressKey === 'locationAddresses') {
      addresses = _.filter(addresses, value => value.categories !== undefined);
    }
    const items = this.mapAddresses(addresses, req);

    return Object.assign({}, locals, {
      items,
      hasAddresses,
      hasCategories
    });
  }

  getAddresses(req) {
    return req.sessionModel.get(this.options.addressKey);
  }

  translateCategories(req, values) {
    return _.castArray(values).map(value => {
      const key = `fields.location-address-category.options.${value}.label`;
      const result = req.translate(key);
      return result === key ? value : result;
    }).join('\n');
  }

  mapAddresses(addresses, req) {
    return _.map(addresses, (value, key) => ({
      id: key,
      address: value.address,
      categories: this.translateCategories(req, value.categories)
    }));
  }

  hasCategories(hasAddresses, addresses) {
    return !!(hasAddresses ? _.sample(addresses).categories !== undefined : false);
  }
};
