
var fs = require('fs'),
    util = require('util'),
    request = require('request'),
    mkdirp = require('mkdirp'),
    pad = require('pad'),
    progress = require('../util/streamProgressBar');

module.exports = function (filename) {

  var remoteFilePath = util.format( 'http://download.geonames.org/export/dump/%s.zip', filename );
  var localFileName = util.format( 'data/%s.zip', filename );
  
  mkdirp( 'data', function( error ){

    if( error ){ return console.error( error ); }
    console.log( 'downloading datafile from:', remoteFilePath );

    request.get( remoteFilePath )
      .pipe( progress( pad( localFileName, 30 ) ) )
      .pipe( fs.createWriteStream( localFileName ) );
    
  });

}