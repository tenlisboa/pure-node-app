_app = {};

_app.tests = {};

_app.tests.unit = require("./unit.test");
_app.tests.api = require("./api.test");

_app.countTests = function () {
  var counter = 0;
  for (var key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      var subTests = _app.tests[key];
      for (var testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          counter++;
        }
      }
    }
  }

  return counter;
};

_app.runTests = function () {
  var errors = [];
  var successes = 0;
  var limit = _app.countTests();
  var counter = 0;
  for (var key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      var subTests = _app.tests[key];
      for (var testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          (function () {
            var tmpTestName = testName;
            var testValue = subTests[testName];

            try {
              testValue(function () {
                // if it calls back without throwing an exception it is succeeded
                console.log("\x1b[32m%s\x1b[0m", tmpTestName);
                counter++;
                successes++;

                // console.log({ counter, limit });
                if (counter === limit) {
                  _app.produceTestReport(limit, successes, errors);
                }
              });
            } catch (err) {
              console.log("\x1b[31m%s\x1b[0m", testName);
              errors.push({ name: testName, error: err });

              counter++;
              if (counter === limit) {
                _app.produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
};

_app.produceTestReport = function (limit, successes, errors) {
  console.log("");
  console.log("----------------- BEGIN TEST REPORT -----------------");
  console.log("");
  console.log("Total Tests: ", limit);
  console.log("Pass: ", successes);
  console.log("Fail: ", errors.length);
  console.log("");

  // if there are errors in the test report, print them
  if (errors.length > 0) {
    console.log("----------------- DETAILED ERRORS -----------------");
    console.log("");

    errors.forEach(function (testError) {
      console.log("\x1b[31m%s\x1b[0m", testError.name);
      console.log(testError.error);
    });
  }

  console.log("");
  console.log("----------------- END TEST REPORT -----------------");
};

_app.runTests();
