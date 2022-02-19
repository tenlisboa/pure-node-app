/*
 * Primary file for API
 *
 */

// Dependencies
var server = require("./lib/server");
var workers = require("./lib/workers");
var cli = require("./lib/cli");
var cluster = require("cluster");
var os = require("os");

// Declare the app
var app = {};

// Init function
app.init = function (callback) {
  if (cluster.isMaster) {
    // Start the workers
    workers.init();

    // Start the cli
    setTimeout(function () {
      cli.init();
      if (callback) callback();
    }, 50);

    // Fork the process
    for (var i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }
  } else {
    // Start the server
    server.init();
  }
};

// Self executing
if (require.main === module) {
  app.init();
}

// Export the app
module.exports = app;
