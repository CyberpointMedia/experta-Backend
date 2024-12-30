/**
 * Module: ApiError
 * Info:  Genrate error for api erros
 **/
const CustomError = require("./customError");
/**
 * Custom Api Error class
 * @param {string} message - Error message for response
 * @param {HTTP Error Code} code - Api supported HTTP Error Codes only [enums/httpStatus.enum]
 * @param {JSON Object | null} data - Provide resource errors for api response
 * @param {boolean} reported - Use for report error for logging
 * @param {boolean} operational - Key for check where error is operational or not
 */
class ApiError extends CustomError {
  constructor(message, code = "INTERNAL_SERVER_ERROR", data = null, operational = false, reported = true) {
    super(message, code, data, operational, reported);
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
