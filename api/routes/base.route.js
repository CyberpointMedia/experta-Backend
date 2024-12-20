/**
 * Module: Base Route
 * Info: Manage All Api Base Routes
 **/

// Import Module dependencies.
const moment = require("moment");
const express = require("express");
const apiRouter = express.Router();

/**
 * Welcome Route of Api
 */
apiRouter.get("/", async (req, res, next) => {
  try {
    await res.apiResponse(
      `Service is healthy. Current timestamp: ${moment().format(
        "DD/MM/YYYY [at] hh:mm A"
      )}`
    );
  } catch (error) {
    next(error);
  }
});

module.exports = apiRouter;
