>This repository is part of the [Pelias](http://pelias.io)
>project. Pelias is an open-source, open-data geocoder built by
>[Mapzen](https://www.mapzen.com/) that also powers [Mapzen Search](https://mapzen.com/projects/search). Our
>official user documentation is [here](https://mapzen.com/documentation/search/).

# Pelias Geonames importer

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pelias/gitter)
[![Build Status](https://travis-ci.org/pelias/geonames.png?branch=master)](https://travis-ci.org/pelias/geonames)
[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/geonames.svg)](https://greenkeeper.io/)

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

```json
{
	"imports": {
		"geonames": {
			"datapath": "/path/to/geonames/data",
			"countryCode": "MX",
			"sourceURL": "http://example.com/geonames/"
		}
	}
}
```

The following are all *optional*:

  * `datapath`: the path to geonames data. Defaults to a directory inside the importer.
  * `countryCode`: the two digit ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1)) country code
    for the country for which data will be downloaded and imported. Use `ALL` for all countries.
  * `sourceURL`: allows for specification of an alternate url prefix for downloads.
	  Will be appended with your specified countryCode and `.zip`.
	  If the field is undefined or an empty string then the code defaults to the official Geonames dumps.

#### Admin Lookup
Pelias has the ability to compute the admin hierarchy (county, region, country, etc)
from [Who's on First](http://whosonfirst.mapzen.com/) data.
For more info on how admin lookup works, see the documentation for
[pelias/wof-admin-lookup](https://github.com/pelias/wof-admin-lookup). By default,
adminLookup is enabled.  To disable, set `imports.adminLookup.enabled` to `false` in Pelias config.

**Note:** Admin lookup requires loading around 5GB of data into memory.

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
The data corresponding to the countryCode in the pelias config file will be downloaded.
`npm run download`

#### Import the downloaded data

`npm start`

### Updating Metadata

The metadata is not shipped with the repo, however, during normal usagage running `npm install` will also trigger a script that updates the metadata.

__However__ this hook will not trigger in non-interactive sessions such as many shell scripts. To explicitly download the metadata or refresh it (it changes very infrequently, perhaps every few months), run:

```
npm run download_metadata
```

The metadata _is_ packaged in our Docker images, so using an up to date docker image should guarantee recent enough metadata.
