/*
 * CLI-Related Tasks
 */

var os = require("os");
var v8 = require("v8");
var readLine = require("readline");
var util = require("util");
var debug = util.debuglog("cli");
var events = require("events");
class _events extends events {}
var e = new _events();
var _data = require("./data");
var _logs = require("./logs");

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
  var stats = {
    "Load Average": os.loadavg().join(" "),
    "CPU Count": os.cpus().length,
    "Free Memory": os.freemem(),
    "Current Malloced Memory": v8.getHeapStatistics().malloced_memory,
    "Peak Malloced Memory": v8.getHeapStatistics().peak_malloced_memory,
    "Allocated Heap Users (%)": Math.round(
      (v8.getHeapStatistics().used_heap_size /
        v8.getHeapStatistics().total_heap_size) *
        100
    ),
    "Available Heap Allocated (%)": Math.round(
      (v8.getHeapStatistics().total_heap_size /
        v8.getHeapStatistics().heap_size_limit) *
        100
    ),
    Uptime: os.uptime() + " Seconds",
  };

  cli.horizontalLine();
  cli.centered("SYSTEM STATISTICS");
  cli.horizontalLine();
  cli.verticalSpace(2);

  for (var key in stats) {
    if (stats.hasOwnProperty(key)) {
      var value = stats[key];
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

  cli.verticalSpace(1);

  cli.horizontalLine();
};

cli.responders.listUsers = function () {
  _data.list("users", function (err, userIds) {
    if (!err && userIds.length > 0) {
      cli.verticalSpace();
      userIds.forEach(function (userId) {
        _data.read("users", userId, function (err, userData) {
          if (!err && userData) {
            var line =
              "Name: " +
              userData.firstName +
              " " +
              userData.lastName +
              " Phone: " +
              userData.phone +
              " Checks: ";

            var numberOfChecks =
              typeof userData.checks == "object" &&
              userData.checks instanceof Array &&
              userData.checks.length > 0
                ? userData.checks.length
                : 0;

            line += numberOfChecks;
            console.log(line);
            cli.verticalSpace();
          }
        });
      });
    }
  });
};

cli.responders.moreUserInfo = function (string) {
  var stringArray = string.split("--");
  var userId =
    typeof stringArray[1] == "string" && stringArray[1].trim().length > 0
      ? stringArray[1].trim()
      : null;

  if (userId) {
    _data.read("users", userId, function (err, userData) {
      if (!err && userData) {
        delete userData.hashedPassword;

        cli.verticalSpace();
        console.dir(userData, { colors: true });
        cli.verticalSpace();
      }
    });
  }
};

cli.responders.listChecks = function (string) {
  _data.list("checks", function (err, checkIds) {
    if (!err && checkIds && checkIds.length > 0) {
      cli.verticalSpace();
      checkIds.forEach(function (checkId) {
        _data.read("checks", checkId, function (err, checkData) {
          if (!err && checkData) {
            var lowerString = string.toLowerCase();

            var state =
              typeof checkData.state == "string" ? checkData.state : "down";

            var stateOrUnknown =
              typeof checkData.state == "string" ? checkData.state : "down";

            if (
              lowerString.indexOf("--" + state) > -1 ||
              (lowerString.indexOf("--down") == -1 &&
                lowerString.indexOf("--up") == -1)
            ) {
              var line =
                "ID: " +
                checkData.id +
                " " +
                checkData.method.toUpperCase() +
                " " +
                checkData.protocol +
                "://" +
                checkData.url +
                " State: " +
                stateOrUnknown;
              console.log(line);
              cli.verticalSpace();
            }
          }
        });
      });
    }
  });
};

cli.responders.moreCheckInfo = function (string) {
  var stringArray = string.split("--");
  var checkId =
    typeof stringArray[1] == "string" && stringArray[1].trim().length > 0
      ? stringArray[1].trim()
      : null;

  if (checkId) {
    _data.read("checks", checkId, function (err, userData) {
      if (!err && userData) {
        delete userData.hashedPassword;

        cli.verticalSpace();
        console.dir(userData, { colors: true });
        cli.verticalSpace();
      }
    });
  }
};

cli.responders.listLogs = function () {
  _logs.list(true, function (err, logFileNames) {
    if (!err && logFileNames) {
      cli.verticalSpace();
      logFileNames.forEach(function (logFileName) {
        if (logFileName.indexOf("-") > -1) {
          console.log(logFileName);
          cli.verticalSpace();
        }
      });
    }
  });
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
