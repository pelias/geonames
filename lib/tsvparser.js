
var csv = require('csv');

var parser = function( mergeOptions, transform )
{
  var options = {
    delimiter: '\t',
    comment: '#',
    quote: null,
    trim: true
  };

  for( var attr in mergeOptions ) {
    options[attr] = mergeOptions[attr];
  }

  return csv()
    .from.options( options )
    .transform( transform );
}

module.exports = parser;