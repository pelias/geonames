var through = require( 'through2' );

var peliasAdminLookup = require( 'pelias-wof-admin-lookup' );

function createAdminLookupStream(enable) {
  if (enable) {
    var pipResolver = peliasAdminLookup.createLocalWofPipResolver();
    return peliasAdminLookup.createLookupStream(pipResolver);
  } else {
    return through.obj(function (doc, enc, next) {
      next(null, doc);
    });
  }
}

module.exports = {
  create: createAdminLookupStream
};
