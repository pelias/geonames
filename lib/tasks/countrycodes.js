
var Table = require('cli-table'),
    countryInfo = require('../../metadata/countryInfo');

var columns = [ 'ISO', 'Country', 'Capital', 'Continent', 'geonameid' ];

function getCountryRow( code ){
  var countryData = countryInfo[ code ];
  return columns.map( function ( attr ){
    return countryData[ attr ] || '';
  });
}

module.exports = function(){

  var table = new Table({
    head: columns,
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
  });

  for( var code in countryInfo ){
    table.push( getCountryRow( code ) );
  }

  console.log( table.toString() );
};
