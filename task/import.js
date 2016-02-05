var geonames = require('geonames-stream');
var peliasConfig = require( 'pelias-config' ).generate();
var peliasAdminLookup = require( 'pelias-admin-lookup' );
var dbclient = require('pelias-dbclient');
var model = require( 'pelias-model' );

var resolvers = require('./resolvers');
var adminLookupMetaStream = require('../lib/streams/adminLookupMetaStream');
var peliasDocGenerator = require( '../lib/streams/peliasDocGenerator');

module.exports = function( filename ){
  var pipeline = resolvers.selectSource( filename )
    .pipe( geonames.pipeline )
    .pipe( peliasDocGenerator.createPeliasDocGenerator() );

  if( peliasConfig.imports.geonames.adminLookup ){
    pipeline = pipeline
      .pipe( adminLookupMetaStream.create() )
      .pipe( peliasAdminLookup.stream() );
  }

  pipeline
    .pipe(model.createDocumentMapperStream())
    .pipe( dbclient() );
};
