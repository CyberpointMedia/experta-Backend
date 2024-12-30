/**
 * Module: ACL Controller
 * Info: Provide methods for ACL based Routes
 **/

// Import Module dependencies.
const asyncWrapper = require("../utils/asyncWrapper");
const ACLService = require("../services/acl.service");

const ACLController = {
  /**
   * @method getRoles
   * Handle get request for list roles
   */
  getRoles: asyncWrapper(async (req, res, next) => {
    const collection = await ACLService.getAllRoles(req);
    await res.apiSearchResponse("Resource list retrieved successfully.", "OK", collection);
  }),
};

module.exports = ACLController;
