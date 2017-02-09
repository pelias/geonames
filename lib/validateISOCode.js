'use strict';

const countryInfo = require('../metadata/countryInfo');
const logger = require( 'pelias-logger' ).get( 'geonames' );

function error( message ){
  logger.error( '\n  ' + message + '\n' );
  process.exit( 1 );
}

function validateISOCode( input ){
  var isocode = ( 'string' === typeof input ) ? input.toUpperCase() : null;
  if( !isocode || ( isocode !== 'ALL' && !( isocode in countryInfo ) ) ){
    const message = `${isocode} is an invalid ISO code. either use \'ALL\'` +
                    `or list available ISO codes with \`npm run countryCodes\``;
    error( message);
  }
  return isocode;
}

module.exports = validateISOCode;
