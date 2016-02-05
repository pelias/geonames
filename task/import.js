
var geonames = require('geonames-stream'),
  through = require('through2'),
  resolvers = require('./resolvers'),
  dbclient = require('pelias-dbclient')(),
  peliasConfig = require( 'pelias-config' ).generate(),
  peliasAdminLookup = require( 'pelias-admin-lookup' );

var peliasDocGenerator = require( 'peliasDocGenerator');

/**
 * Sets values inside Documents' `_meta` objects to indicate that
 * `peliasAdminLookup` shouldn't set certain admin values, depending on their
 * `fcodes`, or feature codes (as documented here:
 * http://www.geonames.org/export/codes.html). This should prevent records for
 * cities/continents/etc. from getting 'neighborhood' names set, which would
 * happen because the corresponding point would likely intersect some
 * neighborhood polygon all the way down.
 */
var adminLookupDontSet = (function (){
  var fcodeAdminDontSet = {
    ADM1: [ 'neighborhood', 'locality', 'local_admin', 'admin2' ],
    ADM2: [ 'neighborhood', 'locality', 'local_admin' ],
    CONT: [ 'neighborhood', 'locality', 'local_admin', 'admin2', 'admin1', 'admin0' ]
  };
  var noNeighborhoods = [
    'PPL', 'STM', 'LK', 'ISL', 'VAL', 'ADM4', 'ADM3', 'WAD', 'AREA', 'CAPE',
    'PPLA3', 'MTS', 'FRST', 'RVN', 'ISLET', 'COVE', 'PPLA2', 'SWMP', 'HDLD',
    'SLP', 'CLF', 'AIRF', 'PPLF', 'GRGE', 'PPLA', 'CNYN', 'BDG', 'PPLC', 'PPLX'
  ];
  noNeighborhoods.forEach( function ( code ){
    fcodeAdminDontSet[ code ] = [ 'neighborhood' ];
  });

  return through.obj( function write( data, _, next ){
    var fcode = data.getMeta( 'fcode' );
    if( fcode in fcodeAdminDontSet ){
      data.setMeta( 'adminLookup', {dontSet: fcodeAdminDontSet[ fcode ]} );
    }
    this.push( data );
    next();
  });
})();

module.exports = function( filename ){
  var pipeline = resolvers.selectSource( filename )
    .pipe( geonames.pipeline )
    .pipe( peliasDocGenerator.createPeliasDocGenerator() );

  if( peliasConfig.imports.geonames.adminLookup ){
    pipeline = pipeline
      .pipe( adminLookupDontSet )
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
