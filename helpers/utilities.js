/*
* Title: Utilities
* Description: Important utility function
* Author: SM Tawhid ( Developer Tawhid )
* Date: 18/08/2021
*/

// Dependencies
const utility = {};
const crypto = require('crypto');
const {secretKey} = require('./environments');

// parse JSOM string to Object
utility.parseJSON = (jsomString) => {
    let output;

    try {
        output = JSON.parse(jsomString)
    } catch {
        return output = {};
    }
    return output;
}

// hash string
utility.hash = (str) => {
    if(typeof str === 'string' && str.length > 0) {
        const hash = 
        crypto.createHmac('sha256', secretKey)
              .update(str)
              .digest('hex');
        return hash;
    }
    return false;
}

// creat random string
utility.createRandomString = (strLength = 0) => {
    let length = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;

    if (length) {
        const possibleCharacters = 'abcdefghijklmnopqrstvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const charactersLength = possibleCharacters.length-1;
        let output = '';
        for(let i=0; i<length; i+=1) {
            output += possibleCharacters.charAt(
                Math.floor(Math.random()*charactersLength)
            )
        }
        return output;
    }

    return false;
}

module.exports = utility;
