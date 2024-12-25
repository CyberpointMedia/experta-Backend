/**
 * Module: Async Wrapper
 * Info: Reusable utility for avoid try catch block in every async request handler in api
 **/

/**
 * Async Wrapper for handling error and reduce try-catch
 * @param {Request} req - Object represents the HTTP request received by the server
 * @param {Response} res - Object represents the HTTP response that the server sends back to the client
 * @param {Next Middlewear} next - Middlewear used to pass control to the next middleware in the chain
 */
const asyncWrapper = (fn) => (req, res, next) => {
  // Catch any unhandled errors in async functions
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncWrapper;
