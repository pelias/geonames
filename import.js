const config = require('pelias-config').generate();
const _ = require('lodash');
const logger = require('pelias-logger').get('geonames');

if (_.has(config, 'imports.geonames.adminLookup')) {
  logger.info('imports.geonames.adminLookup has been deprecated, ' +
              'enable adminLookup using imports.adminLookup.enabled = true');
}

const resolvers = require( './lib/tasks/resolvers' );
const task = require('./lib/tasks/import');
const validateISOCode = require('./lib/validateISOCode');

const countrycode = config.imports.geonames.countryCode;

if (typeof countrycode === 'string') {
  const isocode = validateISOCode( countrycode );
  const filename = isocode === 'ALL' ? 'allCountries' : isocode;
  const source = resolvers.selectSource( filename );
  task( source );    
} else if (Array.isArray(countrycode)) {
    for (var i in countrycode) {
      const filename = validateISOCode( countrycode[i] );
      const source = resolvers.selectSource( filename );
      task( source );
    }
} else {
    throw new Error('imports.geonames.countryCode must be either a string ' +
                    'or an array of strings.');
}
