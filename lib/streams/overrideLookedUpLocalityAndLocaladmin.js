var through2 = require('through2');

// helper function that removes all values at a certain layer and
//  reassigns the name and id from the source record
//
// This is important for geonames because what we consider a locality in geonames
// may not be (and probably isn't) the same locality in WOF.  For example,
// the geonames locality `Sunnyside` in Lancaster, PA is not in the WOF data so
// when adminlookup happens, it's lat/lon is located in the Lancaster, PA
// WOF locality.  This is self-contradictory because now a city is located within
// another city.  This logic forces `locality` and `localadmin` records to be
// in agreement since we store the record itself in it's parentage.
function reassignParent(document, layer) {
  document.clearParent(layer);

  // primary name
  document.addParent(layer, document.getName('default'), document.getId());

  // name aliases
  let aliases = document.getNameAliases('default');
  if( aliases.length ){
    aliases.forEach( alias => {
      document.addParent(layer, alias, document.getId());
    });
  }
}

module.exports.create = function create() {
  return through2.obj(function(document, enc, next) {
    if (document.getLayer() === 'locality') {
      reassignParent(document, 'locality');
    }
    else if (document.getLayer() === 'localadmin') {
      reassignParent(document, 'localadmin');
    }

    next(null, document);
  });
};
