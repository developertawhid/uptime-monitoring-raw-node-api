/*
* Title: Not Found Handler
* Description: 404 Not Found Handler
* Author: SM Tawhid ( Developer Tawhid )
* Date: 18/08/2021
*/


// module scaffolding
const handle = {};

handle.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'Your requested URL was not found!',
    })
}

module.exports = handle;