var Document = require( 'pelias-model' ).Document;
var logger = require( 'pelias-logger' ).get( 'geonames' );
var categoryMapping = require( '../../metadata/category_mapping.json' );
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
