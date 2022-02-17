const _data = require("./data");
const helpers = require("./helpers");
const config = require("../config");

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

    const token = typeof data.headers.token == "string" ? data.headers.token : null

    handlers._tokens.VERIFY_TOKEN(token, phone, function (isValid) {

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
    });
  },

  GET: function (data, callback) {
    const phone =
      typeof data.queryStringObject.phone === "string" &&
      data.queryStringObject.phone.trim().length == 10
        ? data.queryStringObject.phone
        : null;

    if (!phone) return callback(400, { error: "Missing required fields" });

    const token = typeof data.headers.token == "string" ? data.headers.token : null

    handlers._tokens.VERIFY_TOKEN(token, phone, function (isValid) {
      if (!isValid) return callback(403, { error: "Unauthenticated"})

      _data.read("users", phone, function (err, data) {
        if (err && !data) return callback(404);
        delete data.hashedPassword;
        callback(200, data);
      });
    })
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

      const token = typeof data.headers.token == "string" ? data.headers.token : null

      handlers._tokens.VERIFY_TOKEN(token, phone, function (isValid) {
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
    });
  },
  DELETE: function (data, callback) {
    const phone =
      typeof data.payload.phone === "string" &&
      data.payload.phone.trim().length == 10
        ? data.payload.phone
        : null;

    if (!phone) return callback(400, { error: "Missing required fields" });

    const token = typeof data.headers.token == "string" ? data.headers.token : null

    handlers._tokens.VERIFY_TOKEN(token, phone, function (isValid) {
      _data.read("users", phone, function (err, userData) {
        if (err && !userData)
          return callback(400, { error: "The specified user does not exist" });

        _data.delete("users", phone, function (err) {
          if (err) return callback(500, { error: "Could not delete user" });
          callback(200);
        });
      });
    });
  },
};

handlers.tokens = function (data, callback) {
  const acceptableMethods = ["POST", "PUT", "GET", "DELETE"];
  if (acceptableMethods.indexOf(data.method) <= -1) {
    return callback(405);
  }
  handlers._tokens[data.method](data, callback);
};

handlers._tokens = {
  GET: function (data, callback) {
    const id =
      typeof data.queryStringObject.id === "string" &&
      data.queryStringObject.id.trim().length == 20
        ? data.queryStringObject.id
        : null;

    if (!id) return callback(400, { error: "Missing required fields" });

    _data.read("tokens", id, function (err, data) {
      if (err && !data) return callback(404);
      callback(200, data);
    });
  },

  PUT: function (data, callback) {
    const id =
      typeof data.payload.id === "string" && data.payload.id.trim().length == 20
        ? data.payload.id
        : null;

    const extend =
      typeof data.payload.extend === "string" &&
      data.payload.extend.trim().length == true
        ? data.payload.extend
        : null;

    if (!id || !extend)
      return callback(400, { error: "Missing required fields" });

    _data.read("tokens", id, function (err, data) {
      if (err && !data) return callback(404, { error: "Token not found" });

      if (data.expiresAt < Data.now())
        return callback(401, { error: "Token expired" });

      data.expiresAt = Data.now() + 1000 * 60 * 60;

      _data.update("tokens", id, data, function (err) {
        if (err) return callback(500, { error: "Could not update token" });

        callback(200);
      });
    });
  },

  DELETE: function (data, callback) {
    const id =
      typeof data.payload.id === "string" && data.payload.id.trim().length == 10
        ? data.payload.id
        : null;

    if (!id) return callback(400, { error: "Missing required fields" });
    _data.read("tokens", id, function (err, data) {
      if (err && !data)
        return callback(400, { error: "The specified token does not exist" });

      _data.delete("tokens", id, function (err) {
        if (err) return callback(500, { error: "Could not delete token" });
        callback(200);
      });
    });
  },

  POST: function (data, callback) {
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
    _data.read("users", phone, function (err, userData) {
      if (err)
        return callback(400, { error: "Could not find the specified user" });

      const hashedPassword = helpers.hash(password);

      if (!hashedPassword)
        return callback(400, { error: "Could not hash password" });

      if (hashedPassword !== userData.password)
        callback(400, { error: "Password does not match" });

      const tokenId = helpers.createRandomString(20);
      const expiresAt = Date.now() + 1000 * 60 * 60;
      const tokenObject = {
        phone,
        id: tokenId,
        expiresAt,
      };

      _data.create("tokens", tokenId, tokenObject, function (err) {
        if (err) callback(500, { error: "Could not create token" });

        callback(200);
      });
    });
  },

  VERIFY_TOKEN = function (id, phone, callback) {
    _data.read('tokens', id, function (err, data) {
      if (err || data.phone !== phone && data.expiresAt < Date.now()) callback(false)

      callback(true);
    })
  }
};

handlers.checks = function (data, callback) {
  const acceptableMethods = ["POST", "PUT", "GET", "DELETE"];
  if (acceptableMethods.indexOf(data.method) <= -1) {
    return callback(405);
  }
  handlers._checks[data.method](data, callback);
}

handlers._checks = {
  GET: function (data, callback) {},
  POST: function (data, callback) {
    const protocol =
      typeof data.payload.protocol === "string" &&
      ['https', 'http'].indexOf(data.payload.protocol) > -1
        ? data.payload.protocol
        : null;

    const url =
      typeof data.payload.url === "string" &&
      data.payload.url.trim().length > 0
        ? data.payload.url
        : null;

    const method =
      typeof data.payload.method === "string" &&
      ['POST', 'GET', 'PUT', 'DELETE'].indexOf(data.payload.method) > -1
        ? data.payload.method
        : null;

    const successCodes =
      typeof data.payload.successCodes === "object" &&
      data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0
        ? data.payload.successCodes
        : null;

    const timeoutSeconds =
      typeof data.payload.timeoutSeconds === "number" &&
      data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5
        ? data.payload.timeoutSeconds
        : null;

    if (!protocol && !url && !method && !successCodes && !timeoutSeconds) callback(400, {error: "invalid inputs"})

    const token = typeof data.headers.token === "string" ? data.headers.token : null

    _data.read('tokens', token, function(err, tokenData) {
      if (err) return callback(403)

      const userPhone = tokenData.phone;

      _data.read('users', userPhone, function(err, userData) {
        if (err) return callback(404, {error: "There is no user with that token"})

        const userChecks = typeof userData.checks === "object" && userData.checks instanceof Array ? data.checks : [];

        if (userChecks.length > config.maxChecks) callback(400, {error: "Too many checks"})

        const checkId = helpers.createRandomString(20);

        const checkObject =  {
          id: checkId,
          userPhone,
          protocol,
          url,
          method,
          successCodes,
          timeoutSeconds
        }

        _data.create('checks', checkId, checkObject, function(err) {
          if (err) return callback(500, {error: 'Could not create check'})

          userData.checks = [...userChecks, checkObject];

          _data.update('users', userPhone, userData, function(err) {
            if (err) return callback(500, { error: 'Could not update the users with the new check'})

            return callback(200, checkObject)
          })
        })
      })
    })
  },
  PUT: function (data, callback) {},
  DELETE: function (data, callback) {},
};

handlers.ping = (data, callback) => {
  callback(200);
};

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
