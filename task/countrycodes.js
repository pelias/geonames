
var Table = require('cli-table'),
    countryInfo = require('../metadata/countryInfo');

var columns = [ 'ISO', 'Country', 'Capital', 'Continent', 'geonameid' ];

module.exports = function(){
  
  var table = new Table({
    head: columns,
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
  });

  for( var code in countryInfo ){
    table.push( columns.map( function( column ){
      return countryInfo[code][column] || '';
    }));
  }

  console.log( table.toString() );
};