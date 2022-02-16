const _data = require("./data");
const helpers = require("./helpers");

const handlers = {};

handlers.users = function (data, callback) {
  const acceptableMethods = ["POST", "PUT", "GET", "DELETE"];
  if (acceptableMethods.indexOf(data.method) <= -1) {
    return callback(405);
  }
  handlers._users[data.method](data, callback);
};

handlers._users = {
  POST: function (data, callback) {
    const firstName =
      typeof data.payload.firstName === "string" &&
      data.payload.firstName.trim().length > 0
        ? data.payload.firstName
        : null;

    const lastName =
      typeof data.payload.lastName === "string" &&
      data.payload.lastName.trim().length > 0
        ? data.payload.lastName
        : null;

    const phone =
      typeof data.payload.phone === "string" &&
      data.payload.phone.trim().length == 10
        ? data.payload.phone
        : null;

    const password =
      typeof data.payload.password === "string" &&
      data.payload.password.trim().length > 0
        ? data.payload.password
        : null;

    const tosAgreement =
      typeof data.payload.tosAgreement === "boolean" &&
      data.payload.tosAgreement;

    if (!firstName || !lastName || !phone || !password || !tosAgreement) {
      return callback(400, { error: "Missing required fields" });
    }

    _data.read("users", phone, function (err, data) {
      if (err)
        return callback(400, {
          error: "A user with that phone number already exists",
        });

      const hashedPassword = helpers.hash(password);

      if (!hashedPassword)
        return callback(400, { error: "Could not hash password" });

      const userObject = {
        firstName,
        lastName,
        phone,
        hashedPassword,
        tosAgreement,
      };

      _data.create("users", phone, userObject, function (err) {
        if (err) return callback(400, { error: "Could not create user" });
        callback(200);
      });
    });
  },

  GET: function (data, callback) {
    const phone =
      typeof data.queryStringObject.phone === "string" &&
      data.queryStringObject.phone.trim().length == 10
        ? data.queryStringObject.phone
        : null;

    if (!phone) return callback(400, { error: "Missing required fields" });

    _data.read("users", phone, function (err, data) {
      if (err && !data) return callback(404);
      delete data.hashedPassword;
      callback(200, data);
    });
  },

  PUT: function (data, callback) {
    const firstName =
      typeof data.payload.firstName === "string" &&
      data.payload.firstName.trim().length > 0
        ? data.payload.firstName
        : null;

    const lastName =
      typeof data.payload.lastName === "string" &&
      data.payload.lastName.trim().length > 0
        ? data.payload.lastName
        : null;

    const phone =
      typeof data.payload.phone === "string" &&
      data.payload.phone.trim().length == 10
        ? data.payload.phone
        : null;

    const password =
      typeof data.payload.password === "string" &&
      data.payload.password.trim().length > 0
        ? data.payload.password
        : null;

    if (!phone) return callback(400, { error: "Missing required fields" });
    if (!lastName && !firstName && !password)
      return callback(400, { error: "Missing required fields" });
    _data.read("users", phone, function (err, userData) {
      if (err && !userData)
        return callback(400, { error: "The specified user does not exist" });
      if (firstName) userData.firstName = firstName;
      if (lastName) userData.lastName = lastName;
      if (password) userData.password = helpers.hash(password);

      _data.update("users", phone, userData, function (err) {
        if (err) return callback(500, { error: "Could not update user" });
        callback(200);
      });
    });
  },
  DELETE: function (data, callback) {
    const phone =
      typeof data.payload.phone === "string" &&
      data.payload.phone.trim().length == 10
        ? data.payload.phone
        : null;

    if (!phone) return callback(400, { error: "Missing required fields" });
    _data.read("users", phone, function (err, userData) {
      if (err && !userData)
        return callback(400, { error: "The specified user does not exist" });

      _data.delete("users", phone, function (err) {
        if (err) return callback(500, { error: "Could not delete user" });
        callback(200);
      });
    });
  },
};

handlers.ping = (data, callback) => {
  callback(200);
};

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
