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

// Input handlers
e.on("man", function (string) {
  cli.responders.help();
});
e.on("help", function (string) {
  cli.responders.help();
});
e.on("exit", function (string) {
  cli.responders.exit();
});
e.on("stats", function (string) {
  cli.responders.stats();
});
e.on("list users", function (string) {
  cli.responders.listUsers();
});
e.on("more user info", function (string) {
  cli.responders.moreUserInfo(string);
});
e.on("list checks", function (string) {
  cli.responders.listChecks(string);
});
e.on("more check info", function (string) {
  cli.responders.moreCheckInfo(string);
});
e.on("list logs", function (string) {
  cli.responders.listLogs();
});
e.on("more log info", function (string) {
  cli.responders.moreLogInfo(string);
});

// Responders object
cli.responders = {};

cli.responders.help = function () {
  var commands = {
    man: "Show this help message",
    help: "Alias of the 'man' command",
    exit: "Kill the CLI (and the rest of the application)",
    stats: "Get statistis on the underlying operating system and resource util",
    "list users": "Show a list of all registered users",
    "more user info --{userID}": "Show details of a specific user",
    "list checks": "Show a list of all active checks",
    "more check info --{checkID}": "Show details of a specific check",
    "list logs": "Show a list of logs files available to be read",
    "more log info --{fileName}": "Show details of a specific log file",
  };

  // Shoa a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered("CLI MANUAL");
  cli.horizontalLine();
  cli.verticalSpace();

  for (var key in commands) {
    if (commands.hasOwnProperty(key)) {
      var value = commands[key];
      var line = "\x1b[33m" + key + "\x1b[0m";
      var padding = 60 - line.length;
      for (let i = 0; i < padding; i++) {
        line += " ";
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace();

  cli.horizontalLine();
};

cli.verticalSpace = function (lines = 1) {
  for (let i = 0; i < lines; i++) {
    console.log("");
  }
};

cli.horizontalLine = function () {
  var width = process.stdout.columns;

  var line = "";
  for (let i = 0; i < width; i++) {
    line += "-";
  }
  console.log(line);
};

cli.centered = function (text = "") {
  var width = process.stdout.columns;

  var leftPadding = Math.floor((width - text.length) / 2);

  var line = "";
  for (let i = 0; i < leftPadding; i++) {
    line += " ";
  }
  line += text;
  console.log(line);
};

cli.responders.exit = function () {
  process.exit(0);
};

cli.responders.stats = function () {
  console.log("You asked for stats");
};

cli.responders.listUsers = function () {
  console.log("Listing users my baby");
};

cli.responders.moreUserInfo = function (string) {
  console.log("Loggin the information for " + string);
};

cli.responders.listChecks = function (string) {
  console.log("LIsting checks " + string);
};

cli.responders.moreCheckInfo = function (string) {
  console.log("Infomation for check " + string);
};

cli.responders.listLogs = function () {
  console.log("Listing logs");
};

cli.responders.moreLogInfo = function (string) {
  console.log("Information for log " + string);
};

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
