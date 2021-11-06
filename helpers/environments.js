/*
* Title: Environments
* Description: Handle all Environments relates things
* Author: SM Tawhid ( Developer Tawhid )
* Date: 18/08/2021
*/

// dependencies

// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'etUIhjguIYTjkHGytguyjkhguygYh',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15005550006',
        accountSid: 'ACb32411ad7fe886aac54c665d25e5c5d',
        authToken: '9455e3eb3109edc12e3d8c92768f7a67',
    }
}

environments.producton = {
    port: 5000,
    envName: 'production',
    secretKey: 'epfhoOUIOUjhlkuhiuPoiuhUJHPUHjhUhJHBljhIUh',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15005550006',
        accountSid: 'ACb32411ad7fe886aac54c665d25e5c5d',
        authToken: '9455e3eb3109edc12e3d8c92768f7a67',
    }
}

// determine which environment was passed
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport;
