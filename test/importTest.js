var fs = require( 'fs' );
var path = require( 'path');

var tape = require( 'tape' );
var event_stream = require( 'event-stream' );
var deep = require( 'deep-diff' );
const proxyquire = require('proxyquire').noCallThru();
const through = require('through2');

tape('functional test importing Singapore', function(t) {
  var basePath = path.resolve(__dirname);
  var expectedPath = path.join(basePath, 'data', 'expected.json');
  var inputFile = path.join(basePath, 'data', 'SG.zip');

  var sourceStream = fs.createReadStream(inputFile);
  var expected = JSON.parse(fs.readFileSync(expectedPath));

  var endStream = event_stream.writeArray(function(err, results) {
    // uncomment this to write the actual results to the expected file
    // make sure they look ok though. comma left off so jshint reminds you
    // not to commit this line
    // fs.writeFileSync(expectedPath, JSON.stringify(results, null, 2))

    var diff = deep(expected, results);

    if (diff) {
      t.fail('expected and actual output are the same');
      console.error(diff);
    } else {
      t.pass('expected and actual output are the same');
    }
    t.end();
  });

  // need to mock out pelias-wof-admin-lookup because it reads its own config
  // and we don't want an actual adminLookup stream
  const importModule = proxyquire( '../lib/tasks/import', {
    'pelias-wof-admin-lookup': {
      create: () => {
        return through.obj();
      }
    }
  } );

  importModule(sourceStream, endStream);
});
