
/**
  Pelias Geonames metadata downloader
  -----------------------------------

  Downloads & updates local copy of geonames.org meta-data.
**/

var fs = require('fs'),
    util = require('util'),
    request = require('request'),
    JSONStream = require('JSONStream'),
    through = require('through2'),
    pad = require('pad'),
    progress = require('../util/streamProgressBar'),
    metafiles = require('./metafiles');

// tsv parser
var parse = require('csv-parse');
var parser = function( columns )
{
  var options = {
    delimiter: '\t',
    // comment: '#',
    quote: false,
    trim: true,
    columns: columns
  };

  var stream = parse( options );
  return stream;
};

var host = 'http://download.geonames.org/export/dump',
    dest = 'metadata';

var download = function( filename )
{
  var source = util.format( '%s/%s', host, filename );
  var destination = util.format( '%s/%s', dest, filename );
  var fileoptions = metafiles[ filename ];

  // Download metadata file
  var download = request
    .get( source );
    // .pipe( progress( pad( filename, 30 ) ) );

  // Save original .txt file to disk (dev only)
  if( process.env.NODE_ENV === 'development' ){
    var txtWriteStream = fs.createWriteStream( destination );
    download.pipe( txtWriteStream );
  }

  // Write valid json to disk
  var jsonifyStream = JSONStream.stringifyObject( '{\n', ',\n', '\n}' );
  var jsWriteStream = fs.createWriteStream( destination.replace( '.txt', '.json' ) );
  jsonifyStream.pipe( jsWriteStream );

  // Parse tsv and write to jsonify stream
  download
    .pipe( parser( fileoptions.columns ) )
    .pipe( through.obj( function( row, enc, next ){
      var jsonIndex = row[ fileoptions.index ].replace( /[^\w]/g, '' );
      this.push([ jsonIndex, row ]);
      next();
    }))
    .pipe( jsonifyStream );
};

module.exports = function(){
  for( var filename in metafiles ){
    download( filename );
  }
};
