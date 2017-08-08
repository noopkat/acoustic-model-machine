const fs = require('fs');
const reject = require('async/reject');

// creates errors for missing options / files
const findInvalidOptions = (opts, callback) => {
  const requiredOptions = ['subtitle', 'source'];
  const errors = [];

  requiredOptions.forEach((option) => {
    const optionVal = opts[option];

    // was the arg supplied?
    if (!optionVal) {
      return errors.push(new Error(`${option} is a required argument`));
    }
  });

  reject(requiredOptions.map((o) => opts[o]), (filePath, callback) => {
    if (filePath === undefined) return callback(null, true);

    // does the file exist?
    fs.access(filePath, (err) => callback(null, !err));
  }, (err, results) => {
    // generate errors
    const missingFileErrors = results.map((file) => new Error(`file ${file} could not be found`));

    // callback with all errors found
    return callback(null, errors.concat(missingFileErrors));
  });
};

module.exports = { findInvalidOptions };
