var tape = require('tape');
var event_stream = require('event-stream');
var Document = require('pelias-model').Document;

var overrideLookedUpLocalityAndLocaladmin = require('../../lib/streams/overrideLookedUpLocalityAndLocaladmin');

function test_stream(input, testedStream, callback) {
    var input_stream = event_stream.readArray(input);
    var destination_stream = event_stream.writeArray(callback);

    input_stream.pipe(testedStream).pipe(destination_stream);
}

tape('peliasDocGenerator', function(test) {
  test.test('document with layer=locality should overwrite locality parent with name and id', function(t) {
    var input = new Document( 'geonames', 'locality', '17' )
      .setName('default', 'original geonames name')
      .addParent('locality', 'adminlookup locality name', '27', 'abbr');

    var expected = new Document( 'geonames', 'locality', '17' )
      .setName('default', 'original geonames name')
      .addParent('locality', 'original geonames name', '17');

    var override = overrideLookedUpLocalityAndLocaladmin.create();

    test_stream([input], override, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have renamed');
      t.end();
    });

  });

  test.test('document with layer=localadmin should overwrite localadmin parent with name and id', function(t) {
    var input = new Document( 'geonames', 'localadmin', '17' )
      .setName('default', 'original geonames name')
      .addParent('localadmin', 'adminlookup localadmin name', '27', 'abbr');

    var expected = new Document( 'geonames', 'localadmin', '17' )
      .setName('default', 'original geonames name')
      .addParent('localadmin', 'original geonames name', '17');

    var override = overrideLookedUpLocalityAndLocaladmin.create();

    test_stream([input], override, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have renamed');
      t.end();
    });

  });

  test.test('document with non-locality/localadmin layer value should not override anything', function(t) {
    var input = new Document( 'geonames', 'region', '17' )
      .setName('default', 'original geonames name')
      .addParent('localadmin', 'adminlookup localadmin name', '27', 'abbr');

    var expected = input;

    var override = overrideLookedUpLocalityAndLocaladmin.create();

    test_stream([input], override, function(err, actual) {
      t.deepEqual(actual, [expected], 'should not have renamed');
      t.end();
    });

  });

});
