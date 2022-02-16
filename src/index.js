const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");

const server = http.createServer((request, response) => {
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
      payload: buffer,
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
});

server.listen(config.port, () => {
  console.log(
    `Server listening on port :${config.port} on ${config.envName} mode`
  );
});

const handlers = {};

handlers.sample = (data, callback) => {
  callback(406, { name: "Sample handlers" });
};

handlers.notFound = (data, callback) => {
  callback(404);
};

const router = {
  sample: handlers.sample,
};
