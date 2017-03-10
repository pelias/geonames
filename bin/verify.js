const unzipper = require('unzipper');
const sink = require('through2-sink');

const config = require('pelias-config').generate();
const resolvers = require( '.././lib/tasks/resolvers' );

console.log('verifying local file');

const isocode = config.imports.geonames.countryCode;
const filename = isocode === 'ALL' ? 'allCountries' : isocode;
const fileStream = resolvers.getLocalFileStream(filename);

const unzipStream = unzipper.Parse();

unzipStream.on('entry', function(entry) {
  console.log(entry.props);

  // pipe every file to a stream that does nothing
  entry.pipe(sink(function() {}));
}).on('error', function(err) {
  console.error(err);
  process.exit(1);
});

fileStream.pipe(unzipStream);
