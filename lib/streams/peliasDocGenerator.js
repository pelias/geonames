var Document = require( 'pelias-model' ).Document;
var logger = require( 'pelias-logger' ).get( 'geonames' );
var categoryMapping = require( '../../metadata/category_mapping.json' );
var admin1_data = require('../../metadata/admin1CodesASCII');
var admin2_data = require('../../metadata/admin2Codes');
var country_info = require('../../metadata/countryInfo');
var through2 = require('through2');

module.exports = {};

module.exports.create = function() {
  return through2.obj(function(data, enc, next) {
    var record;
    try {
      var layer = data.layer || 'venue';
      record = new Document( 'geonames', layer, data._id )
        .setName( 'default', data.name.trim() )
        .setCentroid({
          lat: data.latitude,
          lon: data.longitude
        });

      try {
        record.setAlpha3( getAlpha3(data.country_code) );
      } catch( err ){}

      try {
        record.setAdmin( 'admin0', getCountryName( data.country_code ) );
      } catch( err ){}

      try {
        record.setAdmin( 'admin1', getAdmin1Name( data ) );
      } catch( err ){}

      try {
        record.setAdmin( 'admin2', getAdmin2Name( data ) );
      } catch( err ){}

      try {
        var population = parseInt(data.population, 10);
        if (population) {
          record.setPopulation( population );
        }
      } catch( err ){}

      if( typeof data.feature_code === 'string' ){
        record.setMeta( 'fcode', data.feature_code );

        var featureCode = data.feature_code.toUpperCase();
        if( categoryMapping.hasOwnProperty( featureCode ) ){
          var peliasCategories = categoryMapping[ featureCode ];
          peliasCategories.forEach( function ( category ){
            record.addCategory( category );
          });
        }
      }

    } catch( e ){
      logger.warn(
        'Failed to create a Document from:', data, 'Exception:', e
      );
    }

    // copy 'name' object to 'phrase' in order to allow ES to create
    // separate indices with different analysis techniques.
    if( record !== undefined ){
      record.phrase = record.name;
      this.push( record );
    }
    next();
  });
};

function getAlpha3(cc) {
  if( country_info.hasOwnProperty(cc) ){
    return country_info[cc].ISO3;
  }
  return null;
}

function getCountryName(cc) {
  if( country_info.hasOwnProperty(cc) ){
    return country_info[cc].Country;
  }
  return null;
}

function getAdmin1Name(data) {
  if( data.country_code && data.admin1_code ){
    var admin1_entry = admin1_data[ data.country_code.concat( data.admin1_code ) ];
    if (admin1_entry && admin1_entry.name) {
      return admin1_entry.name;
    }
  }
}

function getAdmin2Name(data) {
  if( data.country_code && data.admin1_code && data.admin2_code ){
    var admin2_entry = admin2_data[ data.country_code.concat( data.admin1_code, data.admin2_code ) ];
    if (admin2_entry && admin2_entry.name) {
      return admin2_entry.name;
    }
  }
}
