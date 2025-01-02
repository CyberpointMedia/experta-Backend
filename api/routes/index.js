/**
 * Module: Api Routes
 * Info: Register all api routes for handle incoming requests
 **/

// Import Module dependencies.
const express = require("express");
const apiRouter = express.Router();
const aclRoutes = require("./acl.route");

/**
 * Register all routes for api resources.
 */
apiRouter.use("/panel", aclRoutes);

const registerApiRoutes = apiRouter;
module.exports = registerApiRoutes;
