var assert = require("assert");
var helpers = require("../lib/helpers");

var data = require("../lib/data");

var unit = {};

unit["data.list should return a list of users or whatever I passed"] =
  function (done) {
    data.list("users", function (err, userIds) {
      assert.equal(err, false);
      assert.ok(userIds instanceof Array);
    });
    done();
  };

module.exports = unit;
