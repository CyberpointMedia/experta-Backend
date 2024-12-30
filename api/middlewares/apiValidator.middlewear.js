/**
 * Module: Api Validator Middlewear
 * Info: Middlewear to validate request inputs for process further
 **/

// Import Module dependencies.
const validator = require("../utils/validator");
const { ModelError } = require("../utils/errors");

/**
 * Custom validator for manage request inputs validation
 * @param {rules} modelSchema - Validate.js rules schema for specific resource
 */
const apiValidator = (modelSchema) => {
  return (req, res, next) => {
    // Get request inputs
    const inputs = req.body;

    // Apply rules and perform validations
    const errors = validator(inputs, modelSchema);
    if (errors !== true) {
      // If errors, send errors back
      next(new ModelError("We found some errors in your input. Please review the highlighted fields and make corrections.", "UNPROCESSABLE_ENTITY", errors, true, true));
    } else {
      // If no errors, then procceed
      next();
    }
  };
};

module.exports = apiValidator;
