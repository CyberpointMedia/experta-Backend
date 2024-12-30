/**
 * Module: apiResponse middlewear
 * Info: Middlewear for manage api response structure
 **/

// Import Module dependencies.
const HttpStatus = require("../enums/httpStatus.enum");

/**
 * Middlewear to add support for handing consistent response format in entire Api
 */
const apiResponseMiddlewear = (req, res, next) => {
  /**
   * apiResponse function for manage get request for resource's single collection in api without search
   * @param {string} message - represents message for api response to client
   * @param {HTTP Status Code} statusCode - represents the HTTP status code  for manage http status for response
   * @param {JSON || null} data - represent resource's collection data send back to the client
   */
  res.apiResponse = async (message, statusCode = "OK", data = null) => {
    const status = await HttpStatus.getStatusByCode(statusCode);
    const response = {
      status: "success",
      code: statusCode,
      message,
    };
    if (data !== null) {
      response.data = data;
    }
    return res.status(status).json(response);
  };

  /**
   * apiSearchResponse function for manage get request for resource's collection list with search, sorting and pagination meta in api
   * @param {string} message - represents message for api response to client
   * @param {HTTP Status Code} statusCode - represents the HTTP status code  for manage http status for response
   * @param {JSON || null} data - represent resource's collection data send back to the client
   */
  res.apiSearchResponse = async (message, statusCode = "OK", collection = {}) => {
    const status = await HttpStatus.getStatusByCode(statusCode);
    const response = {
      status: "success",
      code: statusCode,
      message,
      metadata: collection.metadata,
      data: collection.data || [],
    };
    return res.status(status).json(response);
  };

  /**
   * apiErrorResponse function for manage resource's and server error response
   * @param {string} message - represents message for api response to client
   * @param {HTTP Status Code} statusCode - represents the HTTP status code  for manage http status for response
   * @param {JSON || null} errors - represent resource and server error object if useful for client response
   */
  res.apiErrorResponse = async (message, statusCode = "INTERNAL_SERVER_ERROR", errors = null) => {
    const status = await HttpStatus.getStatusByCode(statusCode);
    const response = {
      status: "failed",
      code: statusCode,
      message,
    };
    if (errors !== null) {
      response.errors = errors;
    }
    return res.status(status).json(response);
  };

  next();
};

module.exports = apiResponseMiddlewear;
