/*
 * CLI-Related Tasks
 */

var readLine = require("readline");
var util = require("util");
var debug = util.debuglog("cli");
var events = require("events");
class _events extends events {}
var e = new _events();

// Instantiate the CLI module object
var cli = {};

cli.processInput = function (string) {
  string =
    typeof string == "string" && string.trim().length > 0 ? string.trim() : "";

  if (string) {
    var uniqueInputs = [
      "man",
      "help",
      "exit",
      "stats",
      "list users",
      "more user info",
      "list checks",
      "more check info",
      "list logs",
      "more log info",
    ];

    var matchFound = false;
    var counter = 0;
    uniqueInputs.some(function (input) {
      if (string.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // Emit an event mathing the unique input
        e.emit(input, string);
        return true;
      }
    });

    // If no match is found
    if (!matchFound) {
      console.log("Sorry, try again.");
    }
  }
};

cli.init = function () {
  // Send the start message to the console

  console.log("\x1b[34m%s\x1b[0m", "The CLI is running ");

  var _interface = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ">>",
  });

  // Create an initial prompt
  _interface.prompt();

  _interface.on("line", function (string) {
    // Send to the input processer
    cli.processInput(string);

    // Re-initialize the prompt

    _interface.prompt();
  });

  // If the user kill the process
  _interface.on("close", function () {
    process.exit(0);
  });
};

module.exports = cli;
