/**
 * Module: Express
 * Info: Setup express app
 **/

// Load App Env variables
require("dotenv").config();

// Import Module dependencies.
const { API_PREFIX } = require("../config/api.config");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const methodOverride = require("method-override");
const compression = require("compression");

const logger = require("../utils/logger");
const { ApiError } = require("../utils/errors");
const transformError = require("../utils/transformError");
const reportError = require("../utils/reportError");
const apiResponseMiddlewear = require("../middlewares/apiResponse.middlewear");

const registerApiRoutes = require("../routes");
const baseRoutes = require("../routes/base.route");

// Init express app
const app = express();

// Provide custom methods for sending response to client
app.use(apiResponseMiddlewear);

//Express app middlewears
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(methodOverride());
app.use(compression());

//Register API routes
app.use("/", baseRoutes);
app.use(`/${API_PREFIX}`, registerApiRoutes);

// Handle 404 Route Error
app.use("*", (req, res, next) => {
  next(new ApiError("No Route Found", "NOT_FOUND", null, true, true));
});

// Error handling middleware
app.use(async (error, req, res, next) => {
  // Send Api error response to client
  try {
    let statusCode = "INTERNAL_SERVER_ERROR",
      data = null,
      message = "An unexpected error occurred on our server. Please try again later.";

    // Transform error object to handle mangoose or useful code's error to transform error object for api response
    error = await transformError(error);

    //Log error for non operational error
    reportError(error);

    // Set error response if handled by us for more readable response to the client
    if (error.operational && error.operational === true) {
      statusCode = error.code;
      message = error.message;
      data = error.errors;
    }

    await res.apiErrorResponse(message, statusCode, data);
  } catch (error) {
    logger.error(error, "Global error handler");
  }
});
// Export module
module.exports = app;
