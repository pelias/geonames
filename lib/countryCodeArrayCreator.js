const validateISOCode = require('./validateISOCode');

//Just wraps the string into an array and returns an array if all countryCodes are valid
function countryCodeArrayCreator(countrycode) {
    if (typeof countrycode === 'string') {
        const isocode = validateISOCode(countrycode);
        const filename = isocode === 'ALL' ? 'allCountries' : isocode;
        let countrycodeArray = [];
        countrycodeArray.push(filename);
        return countrycodeArray;
    } else if (Array.isArray(countrycode)) {
        for (var i in countrycode) {
            validateISOCode(countrycode[i]);
        }
        return countrycode;
    } else {
        throw new Error('imports.geonames.countryCode must be either a string ' +
            'or an array of strings.');
    }
}

module.exports = countryCodeArrayCreator;
