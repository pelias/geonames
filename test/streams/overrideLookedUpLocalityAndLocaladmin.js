var tape = require('tape');
var Document = require('pelias-model').Document;

var overrideLookedUpLocalityAndLocaladmin = require('../../lib/streams/overrideLookedUpLocalityAndLocaladmin');

const stream_mock = require('stream-mock');

function test_stream(input, testedStream, callback) {
  const reader = new stream_mock.ObjectReadableMock(input);
  const writer = new stream_mock.ObjectWritableMock();
  writer.on('error', (e) => callback(e));
  writer.on('finish', () => callback(null, writer.data));
  reader.pipe(testedStream).pipe(writer);
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
