const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const fs = require("fs");
const path = require("path");

const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");

const httpServer = http.createServer((request, response) => {
  unifiedServer(request, response);
});

httpServer.listen(config.httpPort, () => {
  console.log(
    `Server listening on port :${config.httpPort} on ${config.envName} mode`
  );
});

const httpsServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, "./https/key.pem")),
  cert: fs.readFileSync(path.resolve(__dirname, "./https/cert.pem")),
};
const httpsServer = https.createServer(
  httpsServerOptions,
  (request, response) => {
    unifiedServer(request, response);
  }
);

httpsServer.listen(config.httpsPort, () => {
  console.log(
    `HTTPS Server listening on port :${config.httpsPort} on ${config.envName} mode`
  );
});

const router = {
  sample: handlers.sample,
  users: handlers.users,
  tokens: handlers.tokens,
};

function unifiedServer(request, response) {
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
      typeof router[trimedPath] !== "undefined"
        ? router[trimedPath]
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
}
