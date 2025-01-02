/**
 * Module: ACL Route
 * Info: Register ACL related routes
 **/

// Import Module dependencies.
const express = require("express");
const apiRouter = express.Router();
const ACLController = require("../controllers/acl.controller");

//Register roles related routes
apiRouter.get("/roles", ACLController.getRoles);

module.exports = apiRouter;
