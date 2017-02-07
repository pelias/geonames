'use strict';

const through = require( 'through2' );
const logger = require( 'pelias-logger' ).get( 'geonames' );
const wofAdminLookup = require('pelias-wof-admin-lookup');

function createAdminLookupStream(enable) {
  if (enable) {
    logger.info( 'Setting up admin value lookup stream' );
    return wofAdminLookup.createLookupStream();
  } else {
    return through.obj(function (doc, enc, next) {
      next(null, doc);
    });
  }
}

module.exports = {
  create: createAdminLookupStream
};
