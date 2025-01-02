/**
 * Module : Book Schema Validator
 * Info : Validate data for Book post Schema
 */

//Import Modules dependencies 

const validator = require("../utils/validator");
const ApiError = require("../utils/apiError");

const rules = {
    title: {
      presence: {
        allowEmpty: false,
        message: "can't be blank",
      },
      length: {
        minimum: 3,
        maximum: 100,
        message: "must be between 3 and 100 characters",
      },
      format: {
        pattern: "^[a-zA-Z ]+$",
        message: "can only contain letters and spaces",
      },
    },
    name: {
      presence: {
        allowEmpty: false,
        message: "can't be blank",
      },
      length: {
        minimum: 2,
        maximum: 20,
        message: "must be between 2 and 20 characters",
      },
      format: {
        pattern: "^[a-z]+$",
        message: "must only contain lowercase alphabetic characters",
      },
    },
    resource: {
      presence: {
        allowEmpty: false,
        message: "can't be blank",
      },
      length: {
        minimum: 3,
        maximum: 50,
        message: "must be between 3 and 50 characters",
      },
      format: {
        pattern: "^[a-zA-Z]+$",
        message: "can only contain letters",
      },
      trim: {
        message: "must not contain leading or trailing spaces",
      },
    },
    onlyOwned: {
      presence: {
        allowEmpty: false,
        message: "must be specified",
      },
      inclusion: {
        within: [true, false],
        message: "must be a boolean value",
      },
    },
  };
  
  module.exports = {
    validate(data) {
      const errors = validator.validate(data, rules);
      if (errors) {
        throw new ApiError(400, errors);
      }
    },
  };

