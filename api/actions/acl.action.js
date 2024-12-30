/**
 * Module: ACL Action
 * Info: This layer handles database related action on ACL related schemas
 **/

// Import Module dependencies.
const RoleModel = require("../models/role.model");
const RoleEnum = require("../enums/role.enum");

const ACLAction = {
  /**
   * @method fetchAllRoles
   * To get all roles that can be assigned to any system or app user
   * @param {req.query} queryParams
   */
  fetchAllRoles: async (queryParams) => {
    //Build Query
    const filterQuery = await RoleModel.buildQuery(queryParams);
    //Apply filterQuery and sorting with no pagination
    const payload = await RoleModel.manageSearchPayload(filterQuery, queryParams);
    return payload;
  },

  /**
   * @method fetchRoleByName
   * @desc Find role by roleName
   */
  fetchRoleByName: async (roleName) => {
    return await RoleModel.findOne({ name: { $eq: roleName } }).exec();
  },

  /**
   * @method insertRole
   * @desc create new role
   */
  insertRole: async (payload) => {
    //get private properties
    const privateFields = await RoleEnum.gettRolePrivatePayload(payload.name);

    //Enforce fillable properties wirh private property for new record
    payload = await RoleModel.enforceFillableFields(payload, privateFields);

    //Save and return
    return await new RoleModel(payload).save();
  },
};

module.exports = ACLAction;
