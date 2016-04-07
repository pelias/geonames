var tape = require('tape');

var featureCodeFilterStream = require ('../../lib/streams/featureCodeFilterStream');
var filterRecord = featureCodeFilterStream.filterRecord;

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
});
