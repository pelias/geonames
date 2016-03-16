var through2 = require('through2');

function featureCodeToLayer(featureCode) {
  switch (featureCode) {
      case 'PCLI':
          return 'country';
      case 'ADM1':
          return 'region';
      case 'ADM2':
          return 'county';
      case 'ADMD':
          return 'localadmin';
      case 'PPL':
      case 'PPLA':
      case 'PPLA2':
      case 'PPLA3':
      case 'PPLA4':
      case 'PPLC':
      case 'PPLF':
      case 'PPLG':
      case 'PPLL':
      case 'STLMT':
          return 'locality';
      case 'ADM4':
      case 'ADM5':
      case 'PPLX':
          return 'neighborhood';
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
