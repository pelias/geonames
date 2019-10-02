const through = require('through2');

const adjustName = require('../adjustName');

module.exports = function create() {
  return through.obj(function(doc, enc, next) {
    next(null, adjustName(doc));
  });
};
