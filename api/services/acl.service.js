/**
 * Module: ACLService
 * Info: Manage role and related ability based buisness logics and provide methods consumed by controller
 **/

// Import Module dependencies.
const ACLAction = require("../actions/acl.action");
const ACLService = {
  /**
   * @method getAllRoles
   * Use for exclude field and transfrom JSON object for api
   * @param {Express Request} req
   */
  getAllRoles: async (req) => {
    return await ACLAction.fetchAllRoles(req.query);
  },
};

module.exports = ACLService;
