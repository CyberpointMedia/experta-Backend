/**
 * Module: Validator Module
 * Info: Utility to validate inputs and payload
 **/

// Import Module dependencies.
const validator = require("validate.js");
const moment = require("moment");

/**
 * Custom validator for manage datetime validation
 * @param {validator} datetime - Validate.js custom validator
 */
validator.extend(validator.validators.datetime, {
  // The value is guaranteed not to be null or undefined but otherwise it could be anything.
  parse: function (value, options) {
    return +moment.utc(value);
  },
  // Input is a unix timestamp
  format: function (value, options) {
    var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD HH:MM:SS";
    return moment.utc().format(format);
  },
});

/**
 * Custom validator for manage mumeric field validation for length
 * @param {validator} numlength - Validate.js custom validator
 */
validator.validators.numlength = (value, options, key, attributes) => {
  const min = (options && options.min) || 0;
  const max = (options && options.max) || 0;

  if (!validator.isDefined(value)) {
    return;
  }

  //Check length
  const length = value.toString().length;
  if (min < length) {
    return options.message || ` must be  minimum ${min} digits long`;
  }
  if (max > 0 && max < length) {
    return options.message || ` must be maximum ${max} digits long`;
  }
  return;
};

/**
 * Custom validator for manage year field only
 * @param {validator} validYear - Validate.js custom validator
 */
validator.validators.validYear = (value, options, key, attributes) => {
  if (!validator.isDefined(value)) {
    return;
  }

  if (!validator.isInteger(value)) {
    return options.message || ` must be a valid year`;
  }

  const minYear = (options && options.minYear) || 1000;
  const maxYear = (options && options.maxYear) || new Date().getFullYear();

  //Check length
  if (value < minYear) {
    return options.message || ` must be equal and greater than ${minYear} year`;
  }
  if (value > maxYear) {
    return options.message || ` must be equal and less than ${maxYear} year`;
  }
  return;
};

/**
 * Custom formatter for format error in key:error structure
 * @param {format} apiJson - Validate.js custom formattor
 */
validator.formatters["apiJson"] = function (errObj) {
  let errors = {};
  for (e of errObj) {
    errors[e.attribute] = e.error;
  }
  return errors;
};

module.exports = validator;
