
var geonames = require('geonames-stream'),
  suggester = require('pelias-suggester-pipeline'),
  through = require('through2'),
  resolvers = require('./resolvers'),
  dbclient = require('pelias-dbclient')(),
  model = require( 'pelias-model' ),
  peliasAdminLookup = require( 'pelias-admin-lookup' ),
  logger = require( 'pelias-logger' ).get( 'geonames' );

function mapper( data, enc, next ){
  var record;
  try {
    record = new model.Document( 'geoname', data._id )
      .setName( 'default', data.name.trim() )
      .setCentroid({
        lat: data.latitude,
        lon: data.longitude
      });

    try {
      record.setMeta( 'fcode', data.feature_code );
    }
    catch ( err ) {}

    try {
      record.setAlpha3( resolvers.alpha3(data.country_code) );
    } catch( err ){}

    try {
      record.setAdmin( 'admin0', resolvers.country_name( data.country_code ) );
    } catch( err ){}

    try {
      record.setAdmin( 'admin1', resolvers.admin1_name( data ) );
    } catch( err ){}

    try {
      record.setAdmin( 'admin2', resolvers.admin2_name( data ) );
    } catch( err ){}

    try {
      var population = parseInt(data.population, 10);
      if (population) {
        record.setPopulation( population );
      }
    } catch( err ){}

  } catch( e ){
    logger.warn(
      'Failed to create a Document from:', data, 'Exception:', e
    );
  }

  if( record !== undefined ){
    this.push( record );
  }
  next();
}

var adminValueFilter = (function (){
  var fcodeAdminFilter = {
    ADM1: [ 'neighborhood', 'locality', 'local_admin', 'admin2' ],
    ADM2: [ 'neighborhood', 'locality', 'local_admin' ]
  };
  var noNeighborhoods = [
    'PPL', 'STM', 'LK', 'ISL', 'VAL', 'ADM4', 'ADM3', 'WAD', 'AREA', 'CAPE',
    'PPLA3', 'MTS', 'FRST', 'RVN', 'ISLET', 'COVE', 'PPLA2', 'SWMP', 'HDLD',
    'SLP', 'CLF', 'AIRF', 'PPLF', 'GRGE', 'PPLA', 'CNYN'
  ];
  noNeighborhoods.forEach( function ( code ){
    fcodeAdminFilter[ code ] = [ 'neighborhood' ];
  });

  return through.obj( function write( data, _, next ){
    var fcode = data.getMeta( 'fcode' );
    if( fcode in fcodeAdminFilter ){
      fcodeAdminFilter[ fcode ].forEach( function ( adminName ){
        data.delAdmin( adminName );
      });
    }
    this.push( data );
    next();
  });
})();

module.exports = function( filename ){
  resolvers.selectSource( filename )
    .pipe( geonames.pipeline )
    .pipe( through.obj( mapper ) )
    .pipe( suggester.pipeline )
    .pipe( peliasAdminLookup.stream() )
    .pipe( adminValueFilter )
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
