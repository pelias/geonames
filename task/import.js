
var geonames = require('geonames-stream'),
    suggester = require('pelias-suggester-pipeline'),
    through = require('through2'),
    esclient = require('pelias-esclient')({ throttle: 20 }),
    Backend = require('geopipes-elasticsearch-backend'),
    elasticsearch = new Backend( esclient, 'pelias', 'geoname' ),
    resolvers = require('./resolvers'),
    propStream = require('prop-stream'),
    schema = require('pelias-schema');

function mapper( data, enc, next ){

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
  data.alternatenames.forEach( function( name, i ){
    record.name[ 'alt'+i ] = name;
  });

  this.push(record);
  next();
}

module.exports = function( filename ){

  // show es stats
  esclient.livestats();

  // remove any props not in the geonames mapping
  var allowedProperties = Object.keys( schema.mappings.geoname.properties ).concat( [ 'id', 'type' ] );

  // run import pipeline
  resolvers.selectSource( filename )
    .pipe( geonames.pipeline )
    .pipe( through.obj( mapper ) )
    .pipe( suggester.pipeline )
    .pipe( propStream.whitelist( allowedProperties ) )
    .pipe( elasticsearch.createPullStream() );
    // .pipe( geonames.stringify )
    // .pipe( process.stdout );

};