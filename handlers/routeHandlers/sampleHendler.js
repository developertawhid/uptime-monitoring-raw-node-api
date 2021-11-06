/*
* Title: Sample Handler
* Description: Sample Handler
* Author: SM Tawhid ( Developer Tawhid )
* Date: 18/08/2021
*/


// module scaffolding
const handle = {};

handle.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);

    callback(200, {
        message: 'This is a sample url',
    })
}

module.exports = handle;