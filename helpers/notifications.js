/*
* Title: Notifications Libtaty
* Description: Important functions to notify users
* Author: SM Tawhid ( Developer Tawhid )
* Date: 21/08/2021
*/

// deppendencies
const https = require('https');
const querystring = require('querystring');
const {twilio} = require('./environments')

// module scaffolding 
const notifications = {};

// sent sms to user using twilio api
notifications.sentTwlioSMS = (phone, msg, callback) => {
    // input validation
    const userPhone = typeof(phone) === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMsg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if(userPhone, userMsg) {
        // Configure the request pa
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // stringify the payload
        const stringifyPayload = querystring.stringify(payload);

        // configure the re
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
        };

        // instantiate the request objeect
        const req = https.request(requestDetails, (res) => {
            // get the status of the sent request
            const status = res.statusCode;
            // callback srccessfully if the request went through
            if(status === 200 || 201) {
                callback(false);
            }else {
                callback(`Status code returned was ${status}`);
            }
        });

        req.on('error', (e) => callback(e));
        req.write(stringifyPayload);
        req.end();

    }else {
        callback('Given parameters werw missing or invalid!')
    }
}

// export the module
module.exports = notifications;
