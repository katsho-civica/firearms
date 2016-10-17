'use strict';

const BaseController = require('hof').controllers.base;
const _ = require('lodash');
const fields = _.cloneDeep(require('../fields'));

module.exports = class ContactController extends BaseController {
  getValues(req, res, callback) {
    this.options.fields['contact-holder'].options = _.cloneDeep(fields['contact-holder'].options);
    if (req.sessionModel.get('authority-holders') === 'one') {
      this.options.fields['contact-holder'].options =
        _.without(_.cloneDeep(fields['contact-holder'].options), 'second');
    }

    super.getValues(req, res, callback);
  }
};