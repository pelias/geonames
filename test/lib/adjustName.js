const tape = require('tape');
const adjustName = require('../../lib/adjustName');
const Document = require('pelias-model').Document;

tape('adjustName', function(test) {
  test.test('standard record should be unchanged', function (t) {
    const input_doc = new Document('geonames', 'locality', 1234567)
      .setName('default', 'Normal name');

    const output = adjustName(input_doc);

    t.equal(output.name.default, 'Normal name', 'name unchanged');
    t.end();
  });

  test.test('name starting with City of should be moved to alias', function (t) {
    const input_doc = new Document('geonames', 'locality', 1234567)
      .setName('default', 'City of Detroit');

    const output = adjustName(input_doc);

    t.deepEquals(output.name.default, ['Detroit', 'City of Detroit'], 'name alias created');
    t.end();
  });

  test.test('existing aliases should be respected', function (t) {
    const input_doc = new Document('geonames', 'locality', 1234567)
      .setName('default', 'City of Detroit')
      .setNameAlias('default', 'Hockeytown');

    const output = adjustName(input_doc);

    const expected = ['Detroit', 'Hockeytown', 'City of Detroit'];
    t.deepEquals(output.name.default, expected, 'name alias created, existing alias kept');
    t.end();
  });

});
