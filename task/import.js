
var geonames = require('geonames-stream'),
  through = require('through2'),
  resolvers = require('./resolvers'),
  dbclient = require('pelias-dbclient')(),
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
    .pipe( through.obj( function( item, enc, next ){
      this.push({
        _index: 'pelias',
        _type: item.getType(),
        _id: item.getId(),
        data: item
      });
      next();
    }))
    .pipe( dbclient );
};
