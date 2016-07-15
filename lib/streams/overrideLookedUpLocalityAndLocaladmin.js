var through2 = require('through2');


module.exports.create = function create() {
  return through2.obj(function(document, enc, next) {
    if (document.getLayer() === 'locality') {
      document.clearParent('locality');
      document.addParent('locality', document.getName('default'), document.getId());
    }
    else if (document.getLayer() === 'localadmin') {
      document.clearParent('localadmin');
      document.addParent('localadmin', document.getName('default'), document.getId());
    }

    next(null, document);
  });
};
