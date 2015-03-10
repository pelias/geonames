
var fs = require('fs'),
    util = require('util'),
    request = require('request'),
    logger = require( 'pelias-logger' ).get( 'geonames' );

// use datapath setting from your config file
var settings = require('pelias-config').generate();
var basepath = settings.imports.geonames.datapath;

var admin1_data = require('../metadata/admin1CodesASCII'),
    admin2_data = require('../metadata/admin2Codes'),
    country_info = require('../metadata/countryInfo');

module.exports.selectSource = function(filename,ext) {

  var localFileName = util.format( '%s/%s.zip', basepath, filename );
  var remoteFilePath = util.format( 'http://download.geonames.org/export/dump/%s.zip', filename );
  var opts = ext ? { encoding: 'utf8' } : {};

  if( fs.existsSync( localFileName ) ){
    logger.info( 'reading datafile from disk at:', localFileName );
    return fs.createReadStream( localFileName, opts );
  } else {
    logger.info( 'streaming datafile from:', remoteFilePath );
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
    var admin2_entry = admin2_data[ data.country_code.concat( data.admin1_code, data.admin2_code ) ];
    if (admin2_entry && admin2_entry.name) {
      return admin2_entry.name;
    }
  }
};

module.exports.alternate_names = function(data) {
  if ('string' === typeof data.alternatenames) {
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

module.exports.alpha3 = function(cc) {
  if( country_info.hasOwnProperty(cc) ){
    return country_info[cc].ISO3;
  }
  return null;
};
