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

const isocode = validateISOCode( config.imports.geonames.countryCode );
var filenames = [isocode];
if (isocode === 'ALL') {
  var filenames = require('./metadata/isocodes.json').isocodes;
}

for (var i = 0; i < filenames.length; i++) {
  const filename = filenames[i];

  logger.info( 'importing datafile:', filename );

  const source = resolvers.selectSource( filename );
  task( source );
}
