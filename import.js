const config = require('pelias-config').generate();
const _ = require('lodash');
const logger = require('pelias-logger').get('geonames');
const countryCodeArrayCreator = require('./lib/countryCodeArrayCreator');

if (_.has(config, 'imports.geonames.adminLookup')) {
  logger.info('imports.geonames.adminLookup has been deprecated, ' +
    'enable adminLookup using imports.adminLookup.enabled = true');
}
const countrycode = countryCodeArrayCreator(config.imports.geonames.countryCode);
const resolvers = require('./lib/tasks/resolvers');
const task = require('./lib/tasks/import');
for (var i in countrycode) {
  //No ISO code validation required, already done in countryCodeArrayCreator
  const source = resolvers.selectSource(countrycode[i]);
  task(source);
}
