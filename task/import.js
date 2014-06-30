
// @todo: currently only imports first file it finds in the .zip, needs to be smarter

var fs = require('fs'),
    util = require('util'),
    request = require('request'),
    unzip = require('unzip'),
    tsvparser = require('../lib/tsvparser'),
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

module.exports = function (filename) {

  selectSource(filename)
    .pipe(unzip.Parse())
    .on('entry', function (entry) {
      entry.pipe(
        tsvparser({ columns: columns }, function( data ) {

          esclient.stream.write({
            _index: 'pelias', _type: 'geoname', _id: data._id,
            data: {
              name: data.name,
              alternate_names: alternate_names(data),
              // country_code: data.country_code,
              country_name: country_name(data.country_code),
              // admin1_code: data.admin1_code,
              admin1_name: admin1_name(data),
              // admin2_code: data.admin2_code,
              admin2_name: admin2_name(data),
              // population: data.population,
              center_point: { lat: data.latitude, lon: data.longitude },
              suggest: {
                input: data.name,
                output: data.name,
                payload: {
                  type: 'geoname'
                },
                weight: 1
              }
            }
          });

        })
      )
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
}

function country_name(cc) {
  if( country_info.hasOwnProperty(cc) ){
    return country_info[cc].Country;
  }
  return null;
}
