var fs = require( 'fs' );
var path = require( 'path');

var tape = require( 'tape' );
var deep = require( 'deep-diff' );
const proxyquire = require('proxyquire').noCallThru();
const through = require('through2');
const stream_mock = require('stream-mock');

tape('functional test importing Singapore', function(t) {
  const basePath = path.resolve(__dirname);
  const expectedPath = path.join(basePath, 'data', 'expected.json');
  const inputFile = path.join(basePath, 'data', 'SG.zip');

  const sourceStream = fs.createReadStream(inputFile);
  const expected = JSON.parse(fs.readFileSync(expectedPath));

  const endStream = new stream_mock.ObjectWritableMock();

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

  endStream.on('finish', function() {
    const actual = endStream.data;

    // uncomment this to write the actual results to the expected file
    // make sure they look ok though. semicolon left off so jshint reminds you
    // not to commit this line
    // fs.writeFileSync(expectedPath, JSON.stringify(actual, null, 2))

    const diff = deep(expected, actual);

    if (diff) {
      t.fail('expected and actual output are the same');
      console.error(diff);
    } else {
      t.pass('expected and actual output are the same');
    }
    t.end();
  });
});
