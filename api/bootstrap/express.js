/**
 * Module: Express
 * Info: Setup express app
 **/

// Load App Env variables
require("dotenv").config();

// Import Module dependencies.
const { API_PREFIX } = require("../config/api.config");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");
const transformError = require("../utils/transformError");
const reportError = require("../utils/reportError");
const apiResponseMiddlewear = require("../middlewares/apiResponse.middlewear");
const registerApiRoutes = require("../routes");
const baseRoutes = require("../routes/base.route");

// Init express app
const app = express();

// Setup express app
app.disable("x-powered-by");
app.enable("trust proxy");
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(apiResponseMiddlewear);
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

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
      message =
        "An unexpected error occurred on our server. Please try again later.";

    // Transform error object to handle mangoose or useful code's error to transform error object for api response
    if (!(error instanceof ApiError)) {
      error = await transformError(error);
    }

    //Log error for non operational error
    reportError(error);

    // Set error response if handled by us for more readable response to the client
    if (error instanceof ApiError) {
      statusCode = error.code;
      message = error.message;
      data = error.errors;
    }

    await res.apiErrorResponse(message, statusCode, data);
  } catch (error) {
    logger.info(error);
    logger.info(`Global error handler message: ${error.message}`);
  }
});
// Export module
module.exports = app;
