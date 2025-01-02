/**
 * Module: Base Route
 * Info: Manage All Api Base Routes
 **/

// Import Module dependencies.
const moment = require("moment");
const express = require("express");
const apiRouter = express.Router();
const asyncWrapper = require("../utils/asyncWrapper");

const TestModel = require("../models/verification.model");

/**
 * Welcome Route of Api
 */
apiRouter.get(
  "/",
  asyncWrapper(async (req, res, next) => {
    await res.apiResponse(`Service is healthy. Current timestamp: ${moment().format("DD/MM/YYYY [at] hh:mm A")}`);
  })
);
apiRouter.post(
  "/test",
  asyncWrapper(async (req, res, next) => {
    let data = {};

    await res.apiResponse("Test Response", "OK", data);
  })
);

module.exports = apiRouter;
