const config = require('pelias-config').generate();
const resolvers = require( './lib/tasks/resolvers' );
const task = require('./lib/tasks/import');
const validateISOCode = require('./lib/validateISOCode');

const isocode = validateISOCode( config.imports.geonames.countryCode );
const filename = isocode === 'ALL' ? 'allCountries' : isocode;
const source = resolvers.selectSource( filename );

task( source );
