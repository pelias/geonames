
var parse = require('csv-parse');

var parser = function( mergeOptions, transform )
{
  var options = {
    delimiter: '\t',
    // comment: '#',
    quote: false,
    trim: true
  };

  for( var attr in mergeOptions ) {
    options[attr] = mergeOptions[attr];
  }

  var stream = parse( options );
  return stream;
}

module.exports = parser;