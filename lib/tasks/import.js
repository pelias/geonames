var geonames = require('geonames-stream');
var peliasConfig = require( 'pelias-config' );
var dbclient = require('pelias-dbclient');
var model = require( 'pelias-model' );

var adminLookupStream = require('../streams/adminLookupStream');
var layerMappingStream = require( '../streams/layerMappingStream');
var peliasDocGenerator = require( '../streams/peliasDocGenerator');

module.exports = function( sourceStream, endStream, config ){
  endStream = endStream || dbclient();
  config = config || peliasConfig.generate();

  return sourceStream.pipe( geonames.pipeline )
    .pipe( layerMappingStream.create() )
    .pipe( peliasDocGenerator.create() )
    .pipe( adminLookupStream.create(config.imports.geonames.adminLookup) )
    .pipe(model.createDocumentMapperStream())
    .pipe( endStream );
};
