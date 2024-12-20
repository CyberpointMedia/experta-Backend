/**
 * Module: Logger
 * Info: Use for logging
 **/

// Import Module dependencies.
const HttpStatus = require("../enums/httpStatus.enum");

/**
 * Helper utility to validate HTTP status code for Api
 * @param {HTTP Status Code} CODE
 */
const getHttpStatus = async (CODE) => {
  const statusCode = HttpStatus[CODE];
  if (statusCode) {
    return statusCode;
  } else {
    throw new TypeError(`Invalid http status code : ${CODE}`);
  }
};

module.exports = getHttpStatus;
