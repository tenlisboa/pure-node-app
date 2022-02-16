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

  createRandomString: function (length) {
    length = typeof length === "number" && length > 0 ? length : null;
    if (!length) return null;

    const possibleChars = "abcdefghijklmopqrstuvxz0123456789";

    const srt = "";

    for (i = 1; i < length; i++) {
      const randomChar = possibleChars.charAt(
        Math.floor(Math.random() * possibleChars.length)
      );

      srt += randomChar;
    }

    return srt;
  },
};

module.exports = helpers;
