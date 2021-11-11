var filter = require('through2-filter');
var _ = require( 'lodash' );
var unwantedFcodes = ['CA','GB','NL'];
const config = require('pelias-config').generate();

function filterRecord(data) {
  if(config.imports.geonames.countryCode==='ALL' && _.includes(unwantedFcodes,data.country_code)) {
    return data.postal_code.length > 4;
  }
  return true;
}


function create() {
  return filter.obj(filterRecord);
}

module.exports = {
  filterRecord: filterRecord,
  create: create
};
