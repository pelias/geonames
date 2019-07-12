var tape = require('tape');
var Document = require('pelias-model').Document;
var peliasDocGenerator = require('../../lib/streams/peliasDocGenerator');
const proxyquire = require('proxyquire').noCallThru();
const stream_mock = require('stream-mock');

function test_stream(input, testedStream, callback) {
  const reader = new stream_mock.ObjectReadableMock(input);
  const writer = new stream_mock.ObjectWritableMock();
  writer.on('error', (e) => callback(e));
  writer.on('finish', () => callback(null, writer.data));
  reader.pipe(testedStream).pipe(writer);
}


tape('peliasDocGenerator', function(test) {
  test.test('basic data should should be returned as Document objects with only ' +
              'name and centroid supplied', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 });

    var docGenerator = peliasDocGenerator.create();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('record throwing exception on basic setup should push nothing to next', function(t) {
    const logger = require('pelias-mock-logger')();

    const docGenerator = proxyquire('../../lib/streams/peliasDocGenerator', {
      'pelias-logger': logger
    }).create();

    const input = {
      _id: 12345,
      latitude: 12.121212,
      longitude: 21.212121
    };

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [], 'should not have passed anything thru');
      t.ok(logger.isWarnMessage(/Failed to create a Document from.*/));
      t.end();
    });

  });

  test.test('fcode should be set when available and populate categories case-insensitively', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      feature_code: 'rNgA'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 })
      .setMeta('fcode', 'RNGA')
      .addCategory('government:military')
      .addCategory('government')
      .addCategory('natural');

    var docGenerator = peliasDocGenerator.create();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('unsupported feature_code should set meta fcode but add no categories', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      feature_code: 'Unsupported feature_code'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 })
      .setMeta('fcode', 'Unsupported feature_code');

    var docGenerator = peliasDocGenerator.create();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('population should be set when parseable as radix 10 integer', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      population: '127'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 })
      .setPopulation(127);

    var docGenerator = peliasDocGenerator.create();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('population should not be set when unparseable as radix 10 integer', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      population: 'this isn\'t an integer'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 });

    var docGenerator = peliasDocGenerator.create();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('add name aliases for forward slash delimited names', function(t) {
    var input = {
      _id: 12345,
      name: ' / Something / Else/Two Words ',
      latitude: 1,
      longitude: 1
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Something')
      .setNameAlias('default', 'Else')
      .setNameAlias('default', 'Two Words')
      .setCentroid({ lat: 1, lon: 1 });

    var docGenerator = peliasDocGenerator.create();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });
  });

  test.test('add name aliases for comma delimited names', function(t) {
    var input = {
      _id: 12345,
      name: ' , Something , Else,Two Words ',
      latitude: 1,
      longitude: 1
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Something')
      .setNameAlias('default', 'Else')
      .setNameAlias('default', 'Two Words')
      .setCentroid({ lat: 1, lon: 1 });

    var docGenerator = peliasDocGenerator.create();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });
  });

  test.test('add name aliases for hash delimited names', function(t) {
    var input = {
      _id: 12345,
      name: ' # Something # Else#Two Words ',
      latitude: 1,
      longitude: 1
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Something')
      .setNameAlias('default', 'Else')
      .setNameAlias('default', 'Two Words')
      .setCentroid({ lat: 1, lon: 1 });

    var docGenerator = peliasDocGenerator.create();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });
  });

});
