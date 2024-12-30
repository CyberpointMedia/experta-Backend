/**
 * Module: ModelError
 * Info:  Custom error class for generate model error
 **/
const CustomError = require("./customError");

/**
 * Custom Model Error class
 * @param {string} message - Error message for response
 * @param {HTTP Error Code} code - Api supported HTTP Error Codes only [enums/httpStatus.enum]
 * @param {JSON Object | null} data - Provide resource errors for api response
 * @param {boolean} reported - Use for report error for logging
 * @param {boolean} operational - Key for check where error is operational or not
 */
class ModelError extends CustomError {
  constructor(message, code = "INTERNAL_SERVER_ERROR", data = null, operational = false, reported = false) {
    super(message, code, data, operational, reported);
    this.name = "ModelError";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ModelError;
