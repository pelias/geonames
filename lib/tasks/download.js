'use strict';

const child_process = require('child_process');
const logger = require( 'pelias-logger' ).get( 'geonames' );

// use datapath setting from your config file
const config = require('pelias-config').generate();
const basepath = config.imports.geonames.datapath;
const sourceURL = config.imports.geonames.sourceURL;

module.exports = function (countryCode) {
  const remoteFilePath = (!sourceURL) ? `http://download.geonames.org/export/dump/${countryCode}.zip` : sourceURL+countryCode+'.zip');
  const localFileName = `${basepath}/${countryCode}.zip`;

  logger.info( 'downloading datafile from:', remoteFilePath );

  const command = `curl ${remoteFilePath} > ${localFileName}`;

  const job = child_process.exec(command);

  job.stdout.on('data', (data) => {
      process.stdout.write(data);
  });

  job.stderr.on('data', (data) => {
      process.stderr.write(data);
  });

  job.on('close', (code) => {
      console.log(`Geonames download finished with exit code ${code}`);
      process.exitCode = code;
  });
};
