var dbclient = require('pelias-dbclient');
var unzipper = require('unzipper');
var csv = require('fast-csv');
const through2 = require('through2');
var adminLookupStream = require('pelias-wof-admin-lookup');

var featureCountryFilterPostalStream = require('../streams/featureCountryFilterPostalStream');
var peliasPostalDocGenerator = require('../streams/peliasPostalDocGenerator');
var model = require('pelias-model');
const overrideLookedUpLocalityAndLocaladmin = require('../streams/overrideLookedUpLocalityAndLocaladmin');



var transformJSON = function() {
    return through2.obj(function(data,enc,next){
        data = {
            country_code:data[0],
            postal_code:data[1],
            place_name:data[2],
            admin_name1:data[3],
            admin_code1:data[4],
            admin_name2:data[5],
            admin_code2:data[6],
            admin_name3:data[7],
            admin_code3:data[8],
            latitude:data[9],
            longitude:data[10],
            accuracy:data[11],
        };
        next(null,data);
    });
};

module.exports = function (sourceStream, endStream) {
    endStream = endStream || dbclient({name: 'geonames'});

    sourceStream
            .pipe(unzipper.ParseOne('^(?!readme).*$'))
            .pipe(csv.parse({delimiter:'\t'}))
            .on('finish',()=>{
                console.log('1 file - done');
            })
            .pipe(transformJSON())
            .pipe(featureCountryFilterPostalStream.create())
            .pipe( peliasPostalDocGenerator.create() )
            .pipe( adminLookupStream.create() )
            .pipe( overrideLookedUpLocalityAndLocaladmin.create() )
            .pipe( model.createDocumentMapperStream() )
            // .on('data',(data)=>{
            //     console.log(JSON.stringify(data));
            // });
            .pipe( endStream );





};
