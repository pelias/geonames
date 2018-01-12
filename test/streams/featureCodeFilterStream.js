var tape = require('tape');
var proxyquire = require('proxyquire');
var settings = require('pelias-config').generate();
var featureCodeFilterStream = require ('../../lib/streams/featureCodeFilterStream');
var filterRecord = featureCodeFilterStream.filterRecord;

var fakeGeneratedConfig = {
  imports: {
    geonames: {
      "datapath": "/path/to/geonames/data",
      "countryCode": "MX",
      importVenues: false,
    }
  }
};

var fakeConfig = {
  generate: function fakeGenerate() {
    return fakeGeneratedConfig;
  }
};

tape('feature code filters', function(test) {
  test.test('filtered out records will be removed', function(t) {
    var record = { feature_code: 'RGNE' };
    t.notOk(filterRecord(record), 'RGNE is filtered out');
    t.end();
  });

  test.test('good records are not removed', function(t) {
    var record = { feature_code: 'ADM1' };
    t.ok(filterRecord(record), 'ADM1 is not filtered out');
    t.end();
  });

  test.test('poi records are not removed', function(t) {
    var record = { feature_code: 'BANK' };
    t.ok(filterRecord(record), 'BANK is not filtered out');
    t.end();
  });

  test.test('poi records are removed', function(t) {
    var record = { feature_code: 'BANK' };
    var localFeatureCodeFilterStream = proxyquire('../../lib/streams/featureCodeFilterStream', {'pelias-config': fakeConfig});
    t.notOk(localFeatureCodeFilterStream.filterRecord(record), 'BANK is filtered out');
    t.end();
  });
});
