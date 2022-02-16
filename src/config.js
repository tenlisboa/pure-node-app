const environments = {};

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "thisIsOurSecret",
};

environments.production = {
  httpPort: 80,
  httpsPort: 443,
  envName: "production",
  hashingSecret: "thisIsOurSecret",
};

const currentEnvironment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

const environmentsToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentsToExport;
