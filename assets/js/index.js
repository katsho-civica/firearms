'use strict';

var toolkit = require('hof-frontend-toolkit');
var ac = require('accessible-autocomplete');
var helpers = toolkit.helpers;
var progressiveReveal = toolkit.progressiveReveal;
var formFocus = toolkit.formFocus;
toolkit.detailsSummary();

helpers.documentReady(progressiveReveal);
helpers.documentReady(formFocus);

document.querySelectorAll('.typeahead').forEach(elm => {
  ac.enhanceSelectElement({
    selectElement: elm,
    defaultValue: ''
  });
});
