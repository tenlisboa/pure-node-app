const config = require("../config");

const helpers = {
  hash: function (str) {
    if (typeof str !== "string" && str.length <= 0) return false;

    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");

    return hash;
  },

  jsonToObject: function (str) {
    try {
      return JSON.parse(JSON.stringify(str));
    } catch {
      return {};
    }
  },
};

module.exports = helpers;
