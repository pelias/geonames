'use strict';

const config = require('pelias-config').generate();
const validateISOCode = require('../lib/validateISOCode');

const countryCode = validateISOCode(config.imports.geonames.countryCode);

const filename = countryCode === 'ALL' ? 'allCountries' : countryCode;

const task = require('../lib/tasks/download');
task(filename);
