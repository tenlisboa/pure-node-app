/*
 * Primary file for API
 *
 */

// Dependencies
var server = require("./lib/server");
var workers = require("./lib/workers");
var cli = require("./lib/cli");

// Declare the app
var app = {};

// Init function
app.init = function (callback) {
  // Start the server
  server.init();

  // Start the workers
  workers.init();

  // Start the cli
  setTimeout(function () {
    cli.init();
    callback();
  }, 50);
};

// Self executing
if (require.main === module) {
  app.init();
}

// Export the app
module.exports = app;
