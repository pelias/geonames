var fs = require('fs'),
    util = require('util'),
    request = require('request'),
    logger = require( 'pelias-logger' ).get( 'geonames' );

// use datapath setting from your config file
var settings = require('pelias-config').generate();
var basepath = settings.imports.geonames.datapath;

function getLocalFileStream(filename) {
  var localFileName = util.format( '%s/%s.zip', basepath, filename );
  if( fs.existsSync( localFileName ) ){
    logger.info( 'reading datafile from disk at:', localFileName );
    return fs.createReadStream( localFileName);
  } else {
    return undefined;
  }
}

function getRemoteFileStream(filename) {
  var remoteFilePath = util.format( 'http://download.geonames.org/export/dump/%s.zip', filename );

  logger.info( 'streaming datafile from:', remoteFilePath );
  return request.get( remoteFilePath );
}

function selectSource(filename) {
  return getLocalFileStream(filename) || getRemoteFileStream(filename);
}


function getLocalPostalFileStreams(country) {
  if(country==='allCountries') {
    const full_countries = [ 'CA_full.csv', 'GB_full.csv', 'NL_full.csv'];
    // const full_countries = ['allCountries', 'CA_full.csv', 'GB_full.csv', 'NL_full.csv'];
    const postalFileStreams = [];
    for(const file of full_countries) {
      const localFileName = util.format('%s/postal/%s.zip', basepath, file);

      if (fs.existsSync(localFileName)) {
        logger.info('reading datafile from disk at:', localFileName);
        postalFileStreams.push(fs.createReadStream(localFileName));
      } else {
        logger.warn(`${localFileName} doesn't exist.`);
      }
    }
    return postalFileStreams;
  }
  else{
    const localFileName = util.format('%s/postal/%s.zip', basepath, country);
    if (fs.existsSync(localFileName)) {
      logger.info('reading datafile from disk at:', localFileName);
      return [fs.createReadStream(localFileName)];
    } else {
      return undefined;
    }
  }

}

function getRemotePostalFileStreams(country) {
  var remoteFilePath = util.format( 'http://download.geonames.org/export/zip/%s.zip', country );

  logger.info( 'streaming datafile from:', remoteFilePath );
  return [request.get( remoteFilePath )];
}

function selectPostalSources(country) {
  return getLocalPostalFileStreams(country) || getRemotePostalFileStreams(country);
}

module.exports = {
  getLocalFileStream: getLocalFileStream,
  getRemoteFileStream: getRemoteFileStream,
  selectSource: selectSource,
  selectPostalSources:selectPostalSources
};
