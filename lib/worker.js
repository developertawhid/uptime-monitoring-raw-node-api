/*
* Title: Workers library
* Description: Worker related files
* Author: SM Tawhid ( Developer Tawhid )
* Date: 21/08/2021
*/

// Dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { sentTwlioSMS } = require('../helpers/notifications')

// Worker ogject - module scaffolding
const worker = {};

// lookpup all the checks
worker.gatherAllChecks = () => {
    // get all the checks
    data.list('checks', (err1, checks) => {
        if(!err1 && checks && checks.length > 0) {
            checks.forEach(check => {
                // read the check Data
                data.read('checks', check, (err2, originalCheckData) => {
                    if(!err2 && originalCheckData) {
                        // pass the data to the check validator
                        worker.validateCheckData( parseJSON(originalCheckData) );

                    }else {
                        console.log('Error: reading one of the checks data!');
                    };
                })
            })
        }else {
            console.log('Error: could not find any checks to process!');
        };
    });
};

// validate individual aheck data
worker.validateCheckData = (originalCheckData) => {
    if(originalCheckData && originalCheckData.id) {
        const originalData = {...originalCheckData};
        originalData.state = typeof(originalData.state)  === 'string' && ['up','down'].indexOf(originalData.state) > -1 
        ? originalData.state : 'down';

        originalData.lastChecked = typeof(originalData.lastChecked) == 'number' && originalData.lastChecked > 0 
        ? originalData.lastChecked : false;

        // pass to the next process
        worker.performCheck(originalData);
    }else {
        console.log('Error: check was invalid or not properly formarred!');
    }
}

// perform check
worker.performCheck = (originalCheckData) => {
    // prepate the initial check outcome
    const checkOutCome = {
        error: false,
        responseCode: false
    }

    // mark the outcome has not meen sent yet
    let outcomeSent = false;

    // parse the hostname & full name from original data
    const parsedUrl = url.parse(`${originalCheckData.protocal}://${originalCheckData.url}`, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    // construct the request
    const requestDetails = {
        'protocal': originalCheckData.protocal + ':',
        'hostname': hostName,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeOutSeconds * 2000,
    }

    const protocolToUser = originalCheckData.protocal === 'http' ? http : https;

    let req = protocolToUser.request(requestDetails, (res) => {
        // geab the status of the response
        const status = res.statusCode;

        // update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if(!outcomeSent) {
            worker.prosessCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true
        }
    });

    req.on('error', (e) => {

        checkOutCome = {
            error: true,
            value: e
        }
        // update the check outcome and pass to the next process
        if(!outcomeSent) {
            worker.prosessCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true
        }
    });

    req.on('timeout', (e) => {

        checkOutCome = {
            error: true,
            value: e
        }
        // update the check outcome and pass to the next process
        if(!outcomeSent) {
            worker.prosessCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true
        }
    });

    req.end();

};


// save check outcome to database and send to next process
worker.prosessCheckOutcome = (originalCheckData, checkOutCome) => {
    // check if check outcome is up or down
    const state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    // decide whether we should alert the user or not
    const alertWanterd = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data
    const newCheckData = {...originalCheckData};

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check data to disk
    data.update('checks', newCheckData.id, newCheckData, (err1) => {
        if(!err1) {
            if(alertWanterd) {
                // sent the checkdata to next process
                worker.alertUserToStatusChange(newCheckData);
            }else {
                console.log('Alert is not needed as there is no state change!')
            }
        }else {
            console.log('Error trying to save check data of one of the checks!')
        }
    })
}

// sent notification sms to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()}, ${newCheckData.protocal}://${newCheckData.url} is currently ${newCheckData.state}`;

    sentTwlioSMS(newCheckData.userPhone, msg, (err) => {
        if(!err) {
            console.log(`User was alerted to a status change via SMS ${msg}`)
        }else {
            console.log('Thear was a problem sending sms to one of the user!')
        }
    })
}



// timer to execute the worker process once par minute
worker.loop = () => {
    setInterval(worker.gatherAllChecks, 9000);
};

// start the worker
worker.init = () => {
    // execute all the checks
    worker.gatherAllChecks();

    // call the loop so that checks continue
    worker.loop();
}

// export
module.exports = worker;
