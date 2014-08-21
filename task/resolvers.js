
var fs = require('fs'),
    util = require('util'),
    path = require('path');

var admin1_data = require('../metadata/admin1CodesASCII'),
    admin2_data = require('../metadata/admin2Codes'),
    country_info = require('../metadata/countryInfo');

module.exports.selectSource = function(filename) {

  var localFileName = util.format( 'data/%s.zip', filename );
  var remoteFilePath = util.format( 'http://download.geonames.org/export/dump/%s.zip', filename );

  if( fs.existsSync( localFileName ) ){
    console.log( 'reading datafile from disk at:', localFileName );
    return fs.createReadStream( localFileName );
  } else {
    console.log( 'streaming datafile from:', remoteFilePath );
    return request.get( remoteFilePath );
  }
};

module.exports.admin1_name = function(data) {
  if( data.country_code && data.admin1_code ){
    var admin1_entry = admin1_data[ data.country_code.concat( data.admin1_code ) ];
    if (admin1_entry && admin1_entry.name) {
      return admin1_entry.name;
    }
  }
};

module.exports.admin2_name = function(data) {
  if( data.country_code && data.admin1_code && data.admin2_code ){
    var admin2_entry = admin2_data[ data.country_code.concat( data.admin1_code, data.admin2_code ) ]
    if (admin2_entry && admin2_entry.name) {
      return admin2_entry.name;
    }
  }
};

module.exports.alternate_names = function(data) {
  if ('string' == typeof data.alternatenames) {
    return data.alternatenames.split(',').filter( function( val ){
      return val;
    }).map( function( val ){
      return val.toLowerCase();
    });
  }
  return [];
};

module.exports.country_name = function(cc) {
  if( country_info.hasOwnProperty(cc) ){
    return country_info[cc].Country;
  }
  return null;
};