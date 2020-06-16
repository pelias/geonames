var geonames = require('geonames-stream');
var dbclient = require('pelias-dbclient');
var model = require('pelias-model');
var blacklistStream = require('pelias-blacklist-stream');

const through2_sink = require('through2-sink');

var featureCodeFilterStream = require('../streams/featureCodeFilterStream');
var adminLookupStream = require('pelias-wof-admin-lookup');
var layerMappingStream = require('../streams/layerMappingStream');
var peliasDocGenerator = require('../streams/peliasDocGenerator');
var overrideLookedUpLocalityAndLocaladmin = require('../streams/overrideLookedUpLocalityAndLocaladmin');

let count = 0;

module.exports = function( sourceStream, endStream ){
  //endStream = endStream || dbclient({name: 'geonames'});

  endStream = through2_sink.obj(function(doc) {
    if (count % 100000 === 0) {
      console.log(count);
    }
    count++;
  });

  return sourceStream.pipe( geonames.pipeline )
    .pipe( featureCodeFilterStream.create() )
    .pipe( layerMappingStream.create() )
    .pipe( peliasDocGenerator.create() )
    .pipe( blacklistStream() )
    .pipe( adminLookupStream.create() )
    .pipe( overrideLookedUpLocalityAndLocaladmin.create() )
    .pipe(model.createDocumentMapperStream())
    .pipe( endStream );
};
