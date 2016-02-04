
var geonames = require('geonames-stream'),
  resolvers = require('./resolvers'),
  dbclient = require('pelias-dbclient')(),
  model = require( 'pelias-model' ),
  peliasConfig = require( 'pelias-config' ).generate(),
  peliasAdminLookup = require( 'pelias-admin-lookup' ),
  adminLookupMetaStream = require('../lib/streams/adminLookupMetaStream');

var peliasDocGenerator = require( 'peliasDocGenerator');

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
    .pipe( dbclient );
};
