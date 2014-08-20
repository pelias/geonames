
var fs = require('fs'),
    geonames = require('geonames-stream'),
    suggester = require('pelias-suggester-pipeline'),
    through = require('through2'),
    esclient = require('pelias-esclient')({ throttle: 20 }),
    Backend = require('geopipes-elasticsearch-backend'),
    elasticsearch = new Backend( esclient, 'pelias', 'geoname' );

function mapper( chunk, enc, next ){

  var record = {
    id: data._id,
    name: {
      default: data.name.trim()
    },
    admin0: country_name(data.country_code),
    admin1: admin1_name(data),
    admin2: admin2_name(data),
    center_point: {
      lat: data.latitude,
      lon: data.longitude
    }
  };

  return record;
}

module.exports = function( filename ){

  // show es stats
  esclient.livestats();

  // run import pipeline
  fs.createReadStream( filename )
    .pipe( geonames.pipeline )
    .pipe( through.obj( mapper ) )
    .pipe( suggester.pipeline )
    .pipe( elasticsearch.createPullStream() );

};