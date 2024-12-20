/**
 * Module: ApiError
 * Info:  Custom error class for generate api error
 **/

/**
 * Custom Api Error class
 * @param {string} message - Error message for response
 * @param {HTTP Error Code} code - Api supported HTTP Error Codes only [enums/httpStatus.enum]
 * @param {JSON Object | null} data - Provide resource errors for api response
 * @param {boolean} reported - Use for report error for logging
 * @param {boolean} operational - Key for check where error is operational or not
 */
class ApiError extends Error {
  constructor(
    message,
    code = "INTERNAL_SERVER_ERROR",
    data = null,
    reported = false,
    operational = true
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.errors = data;
    this.reported = reported;
    this.operational = operational;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
