<p align="center">
  <img height="100" src="https://raw.githubusercontent.com/pelias/design/master/logo/pelias_github/Github_markdown_hero.png">
</p>
<h3 align="center">A modular, open-source search engine for our world.</h3>
<p align="center">Pelias is a geocoder powered completely by open data, available freely to everyone.</p>
<p align="center">
<a href="https://en.wikipedia.org/wiki/MIT_License"><img src="https://img.shields.io/github/license/pelias/api?style=flat&color=orange" /></a>
<a href="https://hub.docker.com/u/pelias"><img src="https://img.shields.io/docker/pulls/pelias/api?style=flat&color=informational" /></a>
<a href="https://gitter.im/pelias/pelias"><img src="https://img.shields.io/gitter/room/pelias/pelias?style=flat&color=yellow" /></a>
</p>
<p align="center">
	<a href="https://github.com/pelias/docker">Local Installation</a> ·
        <a href="https://geocode.earth">Cloud Webservice</a> ·
	<a href="https://github.com/pelias/documentation">Documentation</a> ·
	<a href="https://gitter.im/pelias/pelias">Community Chat</a>
</p>
<details open>
<summary>What is Pelias?</summary>
<br />
Pelias is a search engine for places worldwide, powered by open data. It turns addresses and place names into geographic coordinates, and turns geographic coordinates into places and addresses. With Pelias, you’re able to turn your users’ place searches into actionable geodata and transform your geodata into real places.
<br /><br />
We think open data, open source, and open strategy win over proprietary solutions at any part of the stack and we want to ensure the services we offer are in line with that vision. We believe that an open geocoder improves over the long-term only if the community can incorporate truly representative local knowledge.
</details>

# Pelias Geonames importer

This Node.js package imports data from [Geonames](http://geonames.org/) into
[Pelias](http://pelias.io). It includes utilities for downloading and cleaning up the data before
import.

## Requirements

- Node.js. See [Pelias Software requirements](https://github.com/pelias/documentation/blob/master/requirements.md) for supported versions.

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
from [Who's on First](https://whosonfirst.org) data.
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

The metadata is not shipped with the repo, however, during normal usage running `npm install` will also trigger a script that updates the metadata.

__However__ this hook will not trigger in non-interactive sessions such as many shell scripts. To explicitly download the metadata or refresh it (it changes very infrequently, perhaps every few months), run:

```
npm run download_metadata
```

The metadata _is_ packaged in our Docker images, so using an up to date docker image should guarantee recent enough metadata.
