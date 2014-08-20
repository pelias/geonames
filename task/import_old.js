
var fs = require('fs'),
    util = require('util'),
    request = require('request')
    transform = require('stream-transform'),
    unzip = require('unzip'),
    tsvparser = require('../lib/newparser'),
    esclient = require('pelias-esclient')({ throttle: 10 }),
    admin1_data = require('../metadata/admin1CodesASCII'),
    admin2_data = require('../metadata/admin2Codes'),
    country_info = require('../metadata/countryInfo');

var prefixes = [ 'the' ];

esclient.livestats();

var columns = [
  '_id','name','asciiname','alternatenames','latitude','longitude','feature_class',
  'feature_code','country_code','cc2','admin1_code','admin2_code','admin3_code',
  'admin4_code', 'population','elevation','dem','timezone','modification_date'
];

var transformer = transform(function(data, callback){

  var record = {
    name: {
      default: data.name.trim()
    },
    // alternate_names: alternate_names(data),
    // country_code: data.country_code,
    admin0: country_name(data.country_code),
    // admin1_code: data.admin1_code,
    admin1: admin1_name(data),
    // admin2_code: data.admin2_code,
    admin2: admin2_name(data),
    // population: data.population,
    center_point: { lat: data.latitude, lon: data.longitude },
    suggest: {
      input: [],
      output: '',
      payload: {
        id: 'geoname/' + data._id
      }
    }
  }

  // inputs
  record.suggest.input.unshift( record.name.default.toLowerCase() );
  record.suggest.input = record.suggest.input.concat( alternate_names( data ) );

  // allow users to exclude certain common prefixes
  // we search for names beginning with known prefixes
  // and followed by a space.
  // If one is found then we add a copy of that name
  // sans the prefix to the list of inputs
  for( var x=0; x<record.suggest.input.length; x++ ){
    var input = record.suggest.input[x];
    for( var y=0; y<prefixes.length; y++ ){
      var prefix = prefixes[y];
      if( input.substr( 0, prefix.length+1 ) == prefix+' ' ){
        record.suggest.input.push( input.substr( prefix.length+1 ) );
      }
    }
  }

  // de-dupe inputs
  record.suggest.input = record.suggest.input.filter( function( input, pos ) {
    return record.suggest.input.indexOf( input ) == pos;
  });

  // payload
  var adminParts = [];
  record.suggest.payload.geo = record.center_point.lon + ',' + record.center_point.lat;

  if( record.admin2 && record.admin2.length ){
    adminParts.push( record.admin2 );
  }
  else if( record.admin1 && record.admin1.length ){
    adminParts.push( record.admin1 );
  }
  if( record.admin0 && record.admin0.length ){
    adminParts.push( record.admin0 );
  }

  // set output
  record.suggest.output = [ record.name.default ].concat( adminParts ).join(', ').trim();

  // add admin info to input values
  // so they are: "name admin2 admin1 admin0"
  // instead of simply: "name"
  // record.suggest.input = record.suggest.input.map( function( name, i ){
  //   // Set output to the default name
  //   if( i === 0 ){
  //     record.suggest.output = [ name ].concat( adminParts ).join(', ').trim();
  //   }
  //   return [ name ].concat( adminParts ).join(' ').trim();
  // });

  // @todo: find a better way of avoiding key conflicts from the denormalize mget
  // ie: better than prefixing 'gn' to each id
  return callback( null, {
    _index: 'pelias', _type: 'geoname', _id: 'gn'+data._id,
    data: record
  });

});

module.exports = function (filename) {

  selectSource(filename)
    .pipe(unzip.Parse())
    .on('entry', function (entry) {
      if( entry.props.path.match('readme') ) return; // skip readme files
      entry
        .pipe( tsvparser({ columns: columns }) )
        .pipe( transformer )
        .pipe( esclient.stream )
    })
}

function selectSource(filename) {

  var localFileName = util.format( 'data/%s.zip', filename );
  var remoteFilePath = util.format( 'http://download.geonames.org/export/dump/%s.zip', filename );

  if( fs.existsSync( localFileName ) ){
    console.log( 'reading datafile from disk at:', localFileName );
    return fs.createReadStream( localFileName );
  } else {
    console.log( 'streaming datafile from:', remoteFilePath );
    return request.get( remoteFilePath );
  }
}

function admin1_name(data) {
  if( data.country_code && data.admin1_code ){
    var admin1_entry = admin1_data[ data.country_code.concat( data.admin1_code ) ];
    if (admin1_entry && admin1_entry.name) {
      return admin1_entry.name;
    }
  }
}

function admin2_name(data) {
  if( data.country_code && data.admin1_code && data.admin2_code ){
    var admin2_entry = admin2_data[ data.country_code.concat( data.admin1_code, data.admin2_code ) ]
    if (admin2_entry && admin2_entry.name) {
      return admin2_entry.name;
    }
  }
}

function alternate_names(data) {
  if ('string' == typeof data.alternatenames) {
    return data.alternatenames.split(',').filter( function( val ){
      return val;
    }).map( function( val ){
      return val.toLowerCase();
    });
  }
  return [];
}

function country_name(cc) {
  if( country_info.hasOwnProperty(cc) ){
    return country_info[cc].Country;
  }
  return null;
}
