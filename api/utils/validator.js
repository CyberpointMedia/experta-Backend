/**
 * Module: Validator Module
 * Info: Utility to validate inputs and payload
 **/

// Import Module dependencies.
const fastestValidator = require("fastest-validator");
const moment = require("moment");
const runValidator = new fastestValidator();

/**
 *@method apiJson
 * Custom errors payload formatter which return key:error format
 *@param {Array} errors - input invalid errors
 */
function apiJson(errors) {
  return errors.reduce((payload, error) => {
    // Capture the field and message in key-value format
    payload[error.field] = error.message;
    return payload;
  }, {});
}

/**
 *@method validator
 * Validate user's input and return errors if any
 *@param {JSON} rules - validation for schema
 *@param {} inputs - user's input for validation
 */
async function validator(rules, inputs) {
  const validate = runValidator.compile(rules); // Compile the schema
  const errors = validate(inputs); // Validate the data

  // If validation fails, return formatted errors, otherwise return true
  if (errors !== true) {
    return apiJson(errors); // Format errors into key-value format
  }
  return true; // Validation passed
}

module.exports = validator;
