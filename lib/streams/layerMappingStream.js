var through2 = require('through2');

function featureCodeToLayer(featureCode) {
  switch (featureCode) {
      case 'ADM1':
          return 'region';
      case 'ADM2':
          return 'county';
      case 'ADMD':
          return 'locality';
      case 'PPL':
          return 'localadmin';
      default:
          return 'venue';
  }
}

function create() {
  return through2.obj(function(data, enc, next) {
    data.layer = featureCodeToLayer(data.feature_code);

    next(null, data);
  });
}

module.exports = {
  featureCodeToLayer: featureCodeToLayer,
  create: create
};
