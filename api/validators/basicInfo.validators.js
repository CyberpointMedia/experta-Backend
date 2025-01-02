/**
 * Module: BasicInfo Schema Validator
 * Info: Validate data for BasicInfo post and update requests
 **/

// Import Module dependencies.
const validator = require("../../helpers/validator");
const ApiError = require("../../helpers/errors/apiError");
const genderEnum = require("../enums/gender.enum");

// Validation rules for BasicInfo
const rules = {
  firstName: {
    presence: { allowEmpty: false, message: "First name can't be blank" },
    length: {
      minimum: 2,
      maximum: 50,
      message: "First name must be between 2 and 50 characters",
    },
  },
  lastName: {
    length: {
      maximum: 50,
      message: "Last name must be less than 50 characters",
    },
  },
  displayName: {
    length: {
      minimum: 2,
      maximum: 50,
      message: "Display name must be between 2 and 50 characters",
    },
  },
  username: {
    presence: { allowEmpty: false, message: "Username is required" },
  },
  dateOfBirth: {
    presence: { allowEmpty: false, message: "Date of birth is required" },
    datetime: {
      dateOnly: true,
      message: "Date of birth must be a valid date",
    },
  },
  gender: {
    presence: { allowEmpty: false, message: "Gender is required" },
    inclusion: {
      within: Object.values(genderEnum),
      message: `Gender must be one of: ${Object.values(genderEnum).join(", ")}`,
    },
  },
  socialLinks: {
    array: true, // Assuming custom array validation
    nested: {
      name: {
        presence: { allowEmpty: false, message: "Social link name is required" },
      },
      link: {
        presence: { allowEmpty: false, message: "Social link URL is required" },
        format: {
          pattern: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
          message: "Social link must be a valid URL",
        },
      },
    },
  },
  rating: {
    numericality: {
      greaterThanOrEqualTo: 1,
      lessThanOrEqualTo: 5,
      message: "Rating must be between 1 and 5",
    },
  },
};

const basicInfoValidator = async (req, res, next) => {
  try {
    // Perform validation
    let errors = validator(req.body, rules);
    if (errors) {
      throw new ApiError(
        "There are errors in your inputs. Please review and fix them.",
        422,
        errors,
        true
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = basicInfoValidator;
