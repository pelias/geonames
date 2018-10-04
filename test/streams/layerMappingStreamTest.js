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

  test.test('neighborhood is spelled the Queen\'s way', function(t) {
    t.equal(featureCodeToLayer('PPLX'), 'neighbourhood', 'neighbourhood uses British spelling');
    t.end();
  });
});

tape('country specific featureCodes', function(test) {
  test.test('ADM1 in GB maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'GB'), 'macroregion', 'Geonames ADM1 maps to macroregion in Great Britain');
    t.end();
  });

  test.test('ADM1 in FR maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'FR'), 'macroregion', 'Geonames ADM1 maps to macroregion in France');
    t.end();
  });

  test.test('ADM2 in FR maps to region', function(t) {
    t.equal(featureCodeToLayer('ADM2', 'FR'), 'region', 'Geonames ADM2 maps to region in France');
    t.end();
  });

  test.test('ADM3 in FR maps to macrocounty', function(t) {
    t.equal(featureCodeToLayer('ADM3', 'FR'), 'macrocounty', 'Geonames ADM3 maps to macrocounty in France');
    t.end();
  });

  test.test('ADM4 in FR maps to locality', function(t) {
    t.equal(featureCodeToLayer('ADM4', 'FR'), 'locality', 'Geonames ADM4 maps to locality in France');
    t.end();
  });

  test.test('LCTY in FR maps to venue', function(t) {
    t.equal(featureCodeToLayer('LCTY', 'FR'), 'venue', 'Geonames LCTY maps to venue in France');
    t.end();
  });

  test.test('ADM1 in ES maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'ES'), 'macroregion', 'Geonames ADM1 maps to macroregion in Spain');
    t.end();
  });

  test.test('ADM1 in IT maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'IT'), 'macroregion', 'Geonames ADM1 maps to macroregion in Italy');
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

tape('IDtoLayer', function(test){
  test.test('special cases: the nyc boroughs', function(t){
    var input = [
    {_id: 5110302, feature_code: 'PPLA2'},
    {_id: 5125771, feature_code: 'PPLA2'},
    {_id: 5133273, feature_code: 'PPLA2'},
    {_id: 5110266, feature_code: 'PPLA2'},
    {_id: 5139568, feature_code: 'PPLA2'},
    {_id: 5112223, feature_code: 'PPLA'}];
    var stream = layerMappingStream.create();

    test_stream(input,stream,function(err, results){
      var actual = results.map(function(doc){
        return doc.layer;
      });
      var expected = ['borough','borough','borough','borough','borough','locality'];

      test.deepEqual(actual,expected,'special case: NYC handled');
      t.end();
    });
  });
});
