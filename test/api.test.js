var app = require("../index");
var assert = require("assert");
var http = require("http");
var config = require("../lib/config");

var api = {};

var helpers = {};
helpers.makeGetRequest = function (path, callback) {
  var requestDetails = {
    protocol: "http:",
    hostname: "localhost",
    port: config.httpPort,
    method: "GET",
    path,
    headers: {
      "Content-Type": "application/json",
    },
  };

  var req = http.request(requestDetails, function (res) {
    callback(res);
  });
  req.end();
};

api["app.init should start without errors"] = function (done) {
  assert.doesNotThrow(function () {
    app.init(function (err) {
      done();
    });
  }, TypeError);
};

api["/ping should responde to GET with a 200 status code"] = function (done) {
  helpers.makeGetRequest("/ping", function (res) {
    assert.equal(res.statusCode, 200);
    done();
  });
};

api["/api/users should responde to GET with a 400 status code"] = function (
  done
) {
  helpers.makeGetRequest("/api/users", function (res) {
    assert.equal(res.statusCode, 400);
    done();
  });
};

api["A non existing path should responde to GET with a 404 status code"] =
  function (done) {
    helpers.makeGetRequest("/randomly", function (res) {
      assert.equal(res.statusCode, 404);
      done();
    });
  };

module.exports = api;
