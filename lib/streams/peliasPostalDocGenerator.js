var Document = require( 'pelias-model' ).Document;
var logger = require( 'pelias-logger' ).get( 'geonames' );
var through2 = require('through2');
module.exports = {};

module.exports.create = function() {
    return through2.obj(function(data,enc,next){
        var record;
        try{

            const country_code = data.country_code;
            const postal_code = data.postal_code;


            const postal_code_clean =
                (postal_code.includes(country_code)?postal_code.substring(3):postal_code).replace(' ','');
            const id = `${country_code}${postal_code_clean}`;
           const alias = (postal_code.includes(' ')?postal_code.replace(' ',''):null);

            record = new Document('geonames','postalcode', id)
                .setName('default',(alias===null?postal_code:`${postal_code}, ${alias}`))
                .setSource('geonames')
                // .setNameAlias('alt',aliases[0])
                .setCentroid({
                    lat:data.latitude,
                    lon:data.longitude
                })
                .setPopularity(9000)
                .addParent('postalcode',postal_code, id, alias,'geonames');



        }catch (e){
            logger.warn(
                'Failed to create a Document from:', data, 'Exception:', e
            );
        }
        if( record !== undefined ){
            this.push( record );
        }
        next();
    });
};