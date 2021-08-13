const config = require('pelias-config').generate();
const _ = require('lodash');
const logger = require('pelias-logger').get('geonames');

if (_.has(config, 'imports.geonames.adminLookup')) {
  logger.info('imports.geonames.adminLookup has been deprecated, ' +
              'enable adminLookup using imports.adminLookup.enabled = true');
}

const resolvers = require( './lib/tasks/resolvers' );
const task = require('./lib/tasks/importPostal');
const validateISOCode = require('./lib/validateISOCode');
// const dbclient = require('pelias-dbclient');

const isocode = validateISOCode( config.imports.geonames.countryCode );
const filename = isocode === 'ALL' ? 'allCountries' : isocode;
const sources = resolvers.selectPostalSources( filename );

// const endstream = dbclient({name: 'geonames'});

for(const source of sources){
  task( source );
}



