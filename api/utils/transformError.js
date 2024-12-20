/**
 * Module: Transform error object
 * Info:   Transform error object for better api response
 **/

const ApiError = require("../utils/apiError");

/**
 * Transform api error object for managing api response for  mongoose and userful code's error
 * @param {Server} server - Express server instance.
 * @param {string} reason - Reason for shutdown.
 */
const transformError = async (error) => {
  try {
    let field,
      messsage,
      code,
      data = {};

    // Handle MongoDB Error
    message =
      "Some of your inputs are invalid. Please review them and make the necessary corrections.";
    code = "UNPROCESSABLE_ENTITY";
    // Handle Unique Database Constraint Error

    if (error.code && (err.code === 11000 || err.code === 11001)) {
      field = Object.keys(error.keyValue)[0];
      data[field] = `${field} is already taken. Please try wih another value.`;
      error = new ApiError(message, code, data, false, true);
      return error;
    }
    // Handle Mongoose validaion error
    if (error.name && error.name === "ValidationError") {
      Object.keys(error.errors).forEach(function (key, index) {
        data[key] = error.errors[key].message;
      });
      error = new ApiError(message, code, data, false, true);
      return error;
    }

    return error;
  } catch (error) {
    throw error;
  }
};
