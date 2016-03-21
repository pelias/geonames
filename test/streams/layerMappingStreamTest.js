var tape = require('tape');
var event_stream = require('event-stream');

var layerMappingStream = require('../../lib/streams/layerMappingStream');
var featureCodeToLayer = layerMappingStream.featureCodeToLayer;

function test_stream(input, testedStream, callback) {
    var input_stream = event_stream.readArray(input);
    var destination_stream = event_stream.writeArray(callback);

    input_stream.pipe(testedStream).pipe(destination_stream);
}

tape('featureCodeToLayer', function(test) {
  test.test('unusual feature code should map to venue', function(t) {
    t.equal(featureCodeToLayer('CNL'), 'venue', 'all codes not handled map to venue');
    t.end();
  });

  test.test('ADM1 maps to region', function(t) {
    t.equal(featureCodeToLayer('ADM1'), 'region', 'Geonames ADM1 maps to region layer');
    t.end();
  });

  test.test('ADM2 maps to county', function(t) {
    t.equal(featureCodeToLayer('ADM2'), 'county', 'Geonames ADM2 maps to county layer');
    t.end();
  });

  test.test('ADMD maps to localadmin', function(t) {
    t.equal(featureCodeToLayer('ADMD'), 'localadmin', 'Geonames ADMD maps to localadmin layer');
    t.end();
  });
});

tape('country specific featureCodes', function(test) {
  test.test('ADM1 in GB maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'GB'), 'macroregion', 'Geonames ADM1 maps to macroregion in Great Britain');
    t.end();
  });
});

tape('layerMappingStream', function(test) {
  test.test('stream of raw Geonames entries has layers correctly mapped', function(t) {
    var input = [
      { feature_code: 'OCN' },
      { feature_code: 'ADM1' },
      { feature_code: 'POOL' },
      { feature_code: 'ADMD' } ];
    var stream = layerMappingStream.create();

    test_stream(input, stream, function(err, results) {
      var actual = results.map(function(doc) {
        return doc.layer;
      });

      var expected = [ 'venue', 'region', 'venue', 'localadmin' ];
      test.deepEqual(actual, expected, 'layers mapped correctly');
      t.end();
    });
  });
});
