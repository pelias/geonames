var geonames = require('geonames-stream');
var peliasConfig = require( 'pelias-config' );
var peliasAdminLookup = require( 'pelias-admin-lookup' );
var dbclient = require('pelias-dbclient');
var model = require( 'pelias-model' );

var adminLookupMetaStream = require('../streams/adminLookupMetaStream');
var layerMappingStream = require( '../streams/layerMappingStream');
var peliasDocGenerator = require( '../streams/peliasDocGenerator');

module.exports = function( sourceStream, endStream, config ){
  endStream = endStream || dbclient();
  config = config || peliasConfig.generate();

  var pipeline = sourceStream
    .pipe( geonames.pipeline )
    .pipe( layerMappingStream.create() )
    .pipe( peliasDocGenerator.create() );

  if( config.imports.geonames.adminLookup ){
    pipeline = pipeline
      .pipe( adminLookupMetaStream.create() )
      .pipe( peliasAdminLookup.stream() );
  }

  pipeline
    .pipe(model.createDocumentMapperStream())
    .pipe( endStream );
};
