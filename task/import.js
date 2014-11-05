
var geonames = require('geonames-stream'),
    suggester = require('pelias-suggester-pipeline'),
    through = require('through2'),
    resolvers = require('./resolvers'),
    propStream = require('prop-stream'),
    schema = require('pelias-schema'),
    dbclient = require('pelias-dbclient')();

function mapper( data, enc, next ){

  try {
    var record = {
      id: data._id,
      _meta: {
        type: 'geoname'
      },
      name: {
        default: data.name.trim()
      },
      admin0: resolvers.country_name(data.country_code),
      admin1: resolvers.admin1_name(data),
      admin2: resolvers.admin2_name(data),
      center_point: {
        lat: data.latitude,
        lon: data.longitude
      }
    };

    // alternate names
    // @see https://github.com/mapzen/pelias-geonames/issues/5
    // data.alternatenames.forEach( function( name, i ){
    //   record.name[ 'alt'+i ] = name;
    // });

    this.push(record);
  } catch( e ){
    console.error( 'mapper failure', e );
    process.exit(1);
  } finally {
    next();
  }
}

module.exports = function( filename ){

  // remove any props not in the geonames mapping
  var allowedProperties = Object.keys( schema.mappings.geoname.properties ).concat( [ 'id', 'type' ] );

  var counts = {};
  var countStream = function( key, showIds ){
    return through.obj( function( item, enc, next ){
      if( !counts.hasOwnProperty( key ) ){ counts[key] = 0; }
      ++counts[key];
      console.log( 'counts', counts );
      this.push( item );
      next();
    });
  };

  var devnull = through.obj( function( item, enc, next ){
    next();
  });

  // run import pipeline
resolvers.selectSource( filename )
    .pipe( geonames.pipeline )
    .pipe( through.obj( mapper ) )
    .pipe( suggester.pipeline )
    .pipe( propStream.whitelist( allowedProperties ) )
    .pipe( propStream.blacklist( ['tags'] ) )
    .pipe( through.obj( function( item, enc, next ){
      
      var id = item.id;
      delete item.id;

      this.push({
        _index: 'pelias',
        _type: 'geoname',
        _id: id,
        data: item
      });

      next();
    }))
    .pipe( dbclient );
};