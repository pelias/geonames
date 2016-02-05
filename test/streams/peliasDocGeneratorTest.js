var tape = require('tape');
var Document = require('pelias-model').Document;
var peliasDocGenerator = require('../../lib/streams/peliasDocGenerator');
var event_stream = require('event-stream');

function test_stream(input, testedStream, callback) {
    var input_stream = event_stream.readArray(input);
    var destination_stream = event_stream.writeArray(callback);

    input_stream.pipe(testedStream).pipe(destination_stream);
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

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('record throwing exception on basic setup should push nothing to next', function(t) {
    var input = {
      _id: 12345,
      latitude: 12.121212,
      longitude: 21.212121
    };

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [], 'should have returned true');
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

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

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

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('alpha3 and admin0 should be set when country_code is available and known', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      country_code: 'US'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 })
      .setAlpha3('USA')
      .setAdmin('admin0', 'United States');

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('alpha3 and admin0 should not be set when country_code is available and unknown', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      country_code: 'Unknown ISO2'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 });

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('supported country_code and admin1_code should populate admin1', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      country_code: 'US',
      admin1_code: 'AR'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 })
      .setAlpha3('USA')
      .setAdmin('admin0', 'United States')
      .setAdmin('admin1', 'Arkansas');

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('supported country_code and unsupported admin1_code should not populate admin1', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      country_code: 'US',
      admin1_code: 'Unknown admin1_cde'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 })
      .setAlpha3('USA')
      .setAdmin('admin0', 'United States');

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('unsupported country_code and supported admin1_code should not populate admin1', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      country_code: 'Unknown ISO2',
      admin1_code: 'PA'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 });

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('supported country_code, admin1_code, and admin2_code should populate admin2', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      country_code: 'US',
      admin1_code: 'AR',
      admin2_code: '003'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 })
      .setAlpha3('USA')
      .setAdmin('admin0', 'United States')
      .setAdmin('admin1', 'Arkansas')
      .setAdmin('admin2', 'Ashley County');

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

  test.test('supported country_code and admin1_code but unsupported admin2_code ' +
              'should not populate admin2', function(t) {
    var input = {
      _id: 12345,
      name: 'Record Name',
      latitude: 12.121212,
      longitude: 21.212121,
      country_code: 'US',
      admin1_code: 'AR',
      admin2_code: 'Unknown admin2_code'
    };

    var expected = new Document( 'geonames', 'venue', 12345 )
      .setName('default', 'Record Name')
      .setCentroid({ lat: 12.121212, lon: 21.212121 })
      .setAlpha3('USA')
      .setAdmin('admin0', 'United States')
      .setAdmin('admin1', 'Arkansas');

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

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

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

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

    var docGenerator = peliasDocGenerator.createPeliasDocGenerator();

    test_stream([input], docGenerator, function(err, actual) {
      t.deepEqual(actual, [expected], 'should have returned true');
      t.end();
    });

  });

});
