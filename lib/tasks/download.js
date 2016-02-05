
var fs = require('fs-extra'),
    util = require('util'),
    request = require('request'),
    _ = require('lodash'),
    progress = require('../util/streamProgressBar'),
    logger = require( 'pelias-logger' ).get( 'geonames' );

// use datapath setting from your config file
var settings = require('pelias-config').generate();
var basepath = settings.imports.geonames.datapath;

module.exports = function (filename) {

  var remoteFilePath = util.format( 'http://download.geonames.org/export/dump/%s.zip', filename );
  var localFileName = util.format( '%s/%s.zip', basepath, filename );

  fs.mkdirs('data', function(error) {
    if( error ){
      logger.error( error );
      return;
    }
    logger.info( 'downloading datafile from:', remoteFilePath );

    request.get( remoteFilePath )
      .pipe( progress( _.padEnd( localFileName, 30 ) ) )
      .pipe( fs.createWriteStream( localFileName ) );
  });

};
