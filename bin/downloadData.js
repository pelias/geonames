'use strict';

const config = require('pelias-config').generate();
const countryCodeArrayCreator = require('../lib/countryCodeArrayCreator');


const countrycode = countryCodeArrayCreator(config.imports.geonames.countryCode);

const task = require('../lib/tasks/download');
for (var i in countrycode) {
    //No ISO code validation required, already done in countryCodeArrayCreator
    task(countrycode[i]);
}
