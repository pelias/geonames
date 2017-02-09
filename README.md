>This repository is part of the [Pelias](http://pelias.io)
>project. Pelias is an open-source, open-data geocoder built by
>[Mapzen](https://www.mapzen.com/) that also powers [Mapzen Search](https://mapzen.com/projects/search). Our
>official user documentation is [here](https://mapzen.com/documentation/search/).

# Pelias Geonames importer

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pelias/gitter)
[![Build Status](https://travis-ci.org/pelias/geonames.png?branch=master)](https://travis-ci.org/pelias/geonames)

This Node.js package imports data from [Geonames](http://geonames.org/) into
[Pelias](http://pelias.io). It includes utilities for downloading and cleaning up the data before
import.

## Requirements

- Node.js '4.0' or greater

### Installation

```bash
git clone https://github.com/pelias/geonames
cd geonames
npm install
```

### Configuration
The importer can be configured from your local [pelias-config](https://github.com/pelias/config)
(defaults to `~/pelias.json`) in the `imports.geonames` object:

```javascript
{
	"imports": {
		"geonames": {
			"datapath": "/path/to/geonames/data",
			"adminLookup": false,
			"countryCode": "MX"
		}
	}
}
```

The following are all *optional*:

  * `datapath`: the path to geonames data. Defaults to a directory inside the importer.
  * `adminLookup` - set this to true to fill in the administrative hierarchy (country, state,
    county, etc. names), at the cost of higher memory requirements and slower import times. See the
    [pelias/wof-admin-lookup](https://github.com/pelias/wof-admin-lookup) readme for more information on
    how this works and setup documentation (note: this will require downloading the full
    [Who's on First](http://whosonfirst.mapzen.com/) dataset).
  * `countryCode`: the two digit ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1)) country code
    for the country for which data will be downloaded and imported. Use `ALL` for all countries.

### Usage

A list of supported countries and their codes can be viewed with `npm run countryCodes`

```bash
$> npm run countryCodes
┌─────┬──────────────────────────────────────────────┬──────────────────────┬───────────┬───────────┐
│ ISO │ Country                                      │ Capital              │ Continent │ geonameid │
│ AD  │ Andorra                                      │ Andorra la Vella     │ EU        │           │
│ AE  │ United Arab Emirates                         │ Abu Dhabi            │ AS        │ 290557    │
│ AF  │ Afghanistan                                  │ Kabul                │ AS        │ 1149361   │
│ AG  │ Antigua and Barbuda                          │ St. John's           │ NA        │ 3576396   │
```

#### Download the data

`npm run download`

#### Import the downloaded data

`npm start`

### Updating Metadata

The metadata shipped with the repo can get out-of-date, to pull the latest metadata run

`npm run updateMetadata`
