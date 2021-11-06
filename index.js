/*
* Title: Project Initial file
* Description: Initial file to start the node server and workers
* Author: SM Tawhid ( Developer Tawhid )
* Date: 08/21/2021
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/worker');

// app ogject - module scaffolding
const app = {};


// create server
app.init = () => {
    // start the server
    server.init();

    // start the workers
    workers.init();
};

app.init();

module.exports = app;