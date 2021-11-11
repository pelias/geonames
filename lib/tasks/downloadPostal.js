const child_process = require('child_process');
const fs = require('fs');

const logger = require('pelias-logger').get('geonames');

// use datapath setting from your config file
const config = require('pelias-config').generate();
const basepath = config.imports.geonames.datapath;
const sourceURL = config.imports.geonames.sourceURL;

module.exports = function (countryCode) {

    fs.mkdirSync(basepath, {recursive: true});
    fs.mkdirSync(`${basepath}/postal`, {recursive: true});


    const urlPrefix = sourceURL || 'http://download.geonames.org/export/zip';
    const remoteFilePath = `${urlPrefix}/${countryCode}.zip`;


    const localFileName = `${basepath}/postal/${countryCode}.zip`;
    logger.info('downloading datafile from:', remoteFilePath);

    const command = `curl ${remoteFilePath} > ${localFileName}`;


    if (countryCode === 'allCountries') {
        const full_countries = [ 'allCountries','CA_full.csv', 'GB_full.csv', 'NL_full.csv'];
        const jobs = [];
        for (const countryCode of full_countries) {
            const localFileName = `${basepath}/postal/${countryCode}.zip`;
            const remoteFilePath = `${urlPrefix}/${countryCode}.zip`;

            logger.info('downloading datafile from:', remoteFilePath);
            const command = `curl ${remoteFilePath} > ${localFileName}`;
            jobs.push(child_process.exec(command));

        }
        jobs.forEach((job)=>{
            job.stdout.on('data', (data) => {
                process.stdout.write(data);
            });

            job.stderr.on('data', (data) => {
                process.stderr.write(data);
            });
            job.on('close', (code) => {
                process.exitCode = code;
            });
        });
    } else {
        let job = child_process.exec(command);
        job.stdout.on('data', (data) => {
            process.stdout.write(data);
        });

        job.stderr.on('data', (data) => {
            process.stderr.write(data);
        });

        job.on('close', (code) => {
            console.log(`Postal Codes download finished with exit code ${code}`);
            process.exitCode = code;
        });
    }


};
