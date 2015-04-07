
## pelias-geonames

`pelias-geonames` comes with a command-line tool to make it easier to download/parse and import country data in to Pelias.

### install

```bash
npm install
```

### usage

```bash
$> ./bin/pelias-geonames

  Usage: pelias-geonames [options]

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -c, --countrycodes    list all ISO country datasets available for download
    -i, --import [ISO]    import geoname data for [ISO country code] in to Pelias
    -d, --download [ISO]  locally cache data from geonames.org for [ISO country code]
    -m, --meta            download & update geonames metadata files
```

### importing data

For development it's fastest and easiest to just use the data from your local region.

Eg. To just load data specific to `New Zealand` you can run:

```bash
$> ./bin/pelias-geonames -i nz
streaming datafile from: http://download.geonames.org/export/dump/NZ.zip
```

You can download and use a cached copy of the geonames data for imports instead:

```bash
$> ./bin/pelias-geonames -d nz
downloading datafile from: http://download.geonames.org/export/dump/NZ.zip
 data/NZ.zip           [===================] 100% 0.0s

$> ./bin/pelias-geonames -i nz
reading datafile from disk at: data/NZ.zip
```

For a `production` database where you need the entire world, use:

```bash
$> ./bin/pelias-geonames -i all
streaming datafile from: http://download.geonames.org/export/dump/allCountries.zip
```

### listing available datasets

To get a list of all available ISO country codes:

```bash
$> ./bin/pelias-geonames -c
┌─────┬──────────────────────────────────────────────┬──────────────────────┬───────────┬───────────┐
│ ISO │ Country                                      │ Capital              │ Continent │ geonameid │
│ AD  │ Andorra                                      │ Andorra la Vella     │ EU        │           │
│ AE  │ United Arab Emirates                         │ Abu Dhabi            │ AS        │ 290557    │
│ AF  │ Afghanistan                                  │ Kabul                │ AS        │ 1149361   │
│ AG  │ Antigua and Barbuda                          │ St. John's           │ NA        │ 3576396   │
```

### updating metadata

The metadata shipped with the repo can get out-of-date, to pull the latest metadata:

```bash
$> ./bin/pelias-geonames -m
 timeZones.txt                  [===================] 100% 0.0s
 countryInfo.txt                [===================] 100% 0.0s
 featureCodes_en.txt            [===================] 100% 0.0s
 admin1CodesASCII.txt           [===================] 100% 0.0s
 admin2Codes.txt                [===================] 100% 0.0s
```

### pelias-config
The importer can be configured from your local `pelias-config` in the `imports.geonames` object:

```javascript
{
	"imports": {
		"geonames": {
			"datapath": "/path/to/geonames/data",
			"adminLookup": true
		}
	}
}
```

The following are all *optional*:

  * `datapath`: the path to geonames data. Defaults to a directory inside the importer.
  * `adminLookup` - some GeoNames data doesn't have a full administrative hierarchy (ie, country, state,
  county, etc. names), but you can optionally create it via the
  [`pelias/admin-lookup`](https://github.com/pelias/admin-lookup) plugin; just set this property to `true`.  Consult
  the `admin-lookup` README for setup documentation (namely just downloading the Quattroshapes dataset).
