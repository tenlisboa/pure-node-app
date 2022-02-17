const fs = require("fs");
const path = require("path");

const helpers = require("./helpers");

const lib = {};

lib.baseDir = path.join(__dirname, "/../.data");

lib.create = function (dir, file, data, callback) {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        const dataToString = JSON.stringify(data);

        fs.writeFile(fileDescriptor, dataToString, function (err) {
          if (!err) {
            fs.close(fileDescriptor, function (err) {
              if (!err) {
                callback(null);
              } else {
                callback("Error closing the file");
              }
            });
          } else {
            callback("Error writing to the new file");
          }
        });
      } else {
        callback("Could not create a new file, it may already exist");
      }
    }
  );
};

lib.read = function (dir, file, callback) {
  fs.readFile(lib.baseDir + dir + "/" + file + ".json", function (err, data) {
    callback(err, helpers.jsonToObject(data));
  });
};

lib.update = function (dir, file, data, callback) {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        const dataToString = JSON.stringify(data);

        fs.truncate(fileDescriptor, function (err) {
          if (!err) {
            fs.writeFile(fileDescriptor, dataToString, function (err) {
              if (!err) {
                fs.close(fileDescriptor, function (err) {
                  if (!err) {
                    callback(null);
                  } else {
                    callback("Error closing the file");
                  }
                });
              } else {
                callback("Error writing to the existing file");
              }
            });
          } else {
            callback("Error truncating the file");
          }
        });
      } else {
        callback("Could not open the file for update, it may not exist");
      }
    }
  );
};

lib.delete = function (dir, file, callback) {
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", function (err) {
    if (!err) {
      callback(null);
    } else {
      callback("Error deleting the file");
    }
  });
};

lib.list = function (dir, callback) {
  fs.readdir(lib.baseDir + dir + "/", function (err, data) {
    if (err) return callback(err, data);

    const trimmedFileNames = [];
    data.forEach(function (fileName) {
      trimmedFileNames.push(fileName.replace(".json", ""));
    });
    callback(null, trimmedFileNames);
  });
};
