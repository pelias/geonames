var fs = require( 'fs' );
var path = require( 'path');

var tape = require( 'tape' );
var event_stream = require( 'event-stream' );
var deep = require( 'deep-diff' );

var importModule = require( '../lib/tasks/import' );

var basePath = path.resolve(__dirname);
var expectedPath = basePath + '/data/expected.json';
var inputFile = basePath + '/data/SG.zip';

tape('functional test importing Singapore', function(t) {
  var sourceStream = fs.createReadStream(inputFile);
  var expected = JSON.parse(fs.readFileSync(expectedPath));

  var endStream = event_stream.writeArray(function(err, results) {
    // uncomment this to write the actual results to the expected file
    // make sure they look ok though. comma left off so jshint reminds you
    // not to commit this line
    //fs.writeFileSync(expectedPath, JSON.stringify(results, null, 2))

    var diff = deep(expected, results);

    if (diff) {
      t.fail('expected and actual output are the same');
      console.error(diff);
    } else {
      t.pass('expected and actual output are the same');
    }
    t.end();
  });

  var fakePeliasConfig = {
    imports: {
      geonames: {
        adminLookup: false // its not currently feasible to do admin lookup in this test
      }
    }
  };

  importModule(sourceStream, endStream, fakePeliasConfig);
});
