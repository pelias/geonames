'use strict';

const child_process = require('child_process');
const logger = require( 'pelias-logger' ).get( 'geonames' );
const validateISOCode = require('../lib/validateISOCode');

// use datapath setting from your config file
const config = require('pelias-config').generate();
const basepath = config.imports.geonames.datapath;
const countryCode = validateISOCode(config.imports.geonames.countryCode);

const filename = countryCode === 'ALL' ? 'allCountries' : countryCode;

const remoteFilePath = `http://download.geonames.org/export/dump/${filename}.zip`;
const localFileName = `${basepath}/${filename}.zip`;

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
