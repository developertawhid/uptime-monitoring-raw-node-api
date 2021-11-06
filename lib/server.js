/*
* Title: Server library
* Description: Server related files
* Author: SM Tawhid ( Developer Tawhid )
* Date: 08/21/2021
*/

// Dependencies
const http = require('http');
const {handleReqRes} = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

// server ogject - module scaffolding
const server = {};

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environment.port, () => {
        // console.log(`Environnment variable is ${process.env.NODE_ENV}`);
        console.log(`listening to fort ${environment.port}`);
    })
};

// hendle Request Response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
    server.createServer();
}

// export
module.exports = server;