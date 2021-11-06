/*
* Title: Routes
* Description: Application Routes
* Author: SM Tawhid ( Developer Tawhid )
* Date: 18/08/2021
*/

// Dependencies
const {sampleHandler} = require('./handlers/routeHandlers/sampleHendler');
const {userHandler} = require('./handlers/routeHandlers/userHandler');
const {tokenHandler} = require('./handlers/routeHandlers/tokenHandler');
const {checkHandler} = require('./handlers/routeHandlers/checkHandler');


const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
}

module.exports = routes;
