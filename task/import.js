
// @todo: currently only imports first file it finds in the .zip, needs to be smarter

var fs = require('fs'),
    util = require('util'),
    request = require('request'),
    unzip = require('../lib/patched-unzip'),
    tsvparser = require('../lib/newparser'),
    esclient = require('pelias-esclient')(),
    admin1_data = require('../metadata/admin1CodesASCII'),
    admin2_data = require('../metadata/admin2Codes'),
    country_info = require('../metadata/countryInfo');

esclient.livestats();

var columns = [
  '_id','name','asciiname','alternatenames','latitude','longitude','feature_class',
  'feature_code','country_code','cc2','admin1_code','admin2_code','admin3_code',
  'admin4_code', 'population','elevation','dem','timezone','modification_date'
];

var transform = require('stream-transform');

var transformer = transform(function(data, callback){

  if( !data.name ) return callback( null, null );

  var record = {
    name: data.name,
    // alternate_names: alternate_names(data),
    // country_code: data.country_code,
    admin0: country_name(data.country_code),
    // admin1_code: data.admin1_code,
    admin1: admin1_name(data),
    // admin2_code: data.admin2_code,
    admin2: admin2_name(data),
    // population: data.population,
    center_point: { lat: data.latitude, lon: data.longitude },
    suggest: {
      input: [],
      payload: {
        type: 'geoname'
      }
    }
  }

  // inputs
  record.suggest.input = alternate_names(data);
  if( -1 == record.suggest.input.indexOf( data.name ) ){
    record.suggest.input.unshift( data.name );
  }

  // payload
  record.suggest.payload.name = record.name;
  record.suggest.payload.geo = record.center_point.lon + ',' + record.center_point.lat;
  
  if( record.admin2 && record.admin2.length ){
    record.suggest.payload.admin2 = record.admin2;
  }
  if( record.admin1 && record.admin1.length ){
    record.suggest.payload.admin1 = record.admin1;
  }
  if( record.admin0 && record.admin0.length ){
    record.suggest.payload.admin0 = record.admin0;
  }

  return callback( null, {
    _index: 'pelias', _type: 'geoname', _id: data._id,
    data: record
  });

}, {parallel: 100}); // @todo experiment with this setting

module.exports = function (filename) {

  selectSource(filename)
    .pipe(unzip.Parse())
    .on('entry', function (entry) {
      entry
        .pipe( tsvparser({ columns: columns }) )
        .pipe( transformer )
        .pipe( esclient.stream )
    })
}

function selectSource(filename) {

  var localFileName = util.format( 'data/%s.zip', filename );
  var remoteFilePath = util.format( 'http://download.geonames.org/export/dump/%s.zip', filename );

  if( fs.existsSync( localFileName ) ){
    console.log( 'reading datafile from disk at:', localFileName );
    return fs.createReadStream( localFileName );
  } else {
    console.log( 'streaming datafile from:', remoteFilePath );
    return request.get( remoteFilePath );
  }
}

function admin1_name(data) {
  if( data.country_code && data.admin1_code ){
    var admin1_entry = admin1_data[ data.country_code.concat( data.admin1_code ) ];
    if (admin1_entry && admin1_entry.name) {
      return admin1_entry.name;
    }
  }
}

function admin2_name(data) {
  if( data.country_code && data.admin1_code && data.admin2_code ){
    var admin2_entry = admin2_data[ data.country_code.concat( data.admin1_code, data.admin2_code ) ]
    if (admin2_entry && admin2_entry.name) {
      return admin2_entry.name;
    }
  }
}

function alternate_names(data) {
  if ('string' == typeof data.alternatenames) {
    return data.alternatenames.split(',');
  }
  return [];
}

function country_name(cc) {
  if( country_info.hasOwnProperty(cc) ){
    return country_info[cc].Country;
  }
  return null;
}
