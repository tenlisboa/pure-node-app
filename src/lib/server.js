const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("../config");
const fs = require("fs");
const path = require("path");

const handlers = require("../lib/handlers");
const helpers = require("../lib/helpers");

const server = {
  httpServer: http.createServer((request, response) => {
    unifiedServer(request, response);
  }),

  httpsServer: https.createServer(
    {
      key: fs.readFileSync(path.resolve(__dirname, "../https/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../https/cert.pem")),
    },
    (request, response) => {
      unifiedServer(request, response);
    }
  ),
};

server.router = {
  sample: handlers.sample,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};

server.unifiedServer = function (request, response) {
  const parsedUrl = url.parse(request.url, true);

  const path = parsedUrl.pathname;
  const trimedPath = path.replace(/^\/+|\/+$/g, "");

  const queryStringObject = parsedUrl.query;

  const method = request.method.toUpperCase();

  const headers = request.headers;

  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  request.on("data", (data) => {
    buffer += decoder.write(data);
  });
  request.on("end", () => {
    buffer += decoder.end();

    const chosenHandler =
      typeof server.router[trimedPath] !== "undefined"
        ? server.router[trimedPath]
        : handlers.notFound;

    const data = {
      trimedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.jsonToObject(buffer),
    };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      payload = typeof payload === "object" ? payload : {};

      const payloadString = JSON.stringify(payload);

      response.setHeader("Content-Type", "application/json");
      response.writeHead(statusCode);
      response.end(payloadString);
    });
  });
};

server.init = function () {
  server.httpServer.listen(config.httpPort, () => {
    console.log(
      `Server listening on port :${config.httpPort} on ${config.envName} mode`
    );
  });

  server.httpsServer.listen(config.httpsPort, () => {
    console.log(
      `HTTPS Server listening on port :${config.httpsPort} on ${config.envName} mode`
    );
  });
};

module.exports = server;
