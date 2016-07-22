'use strict';

const bootstrap = require('hof-bootstrap');

// See https://github.com/UKHomeOffice/hof-bootstrap for details

bootstrap({
  views: false,
  fields: false,
  routes: [
    require('./apps/new-dealer')
  ]
});
