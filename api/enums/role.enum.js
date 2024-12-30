/**
 * Module: Role Enum
 * Info: Manage private fields for specific role
 **/
const { ModelError } = require("../utils/errors");
const RoleEnum = Object.freeze({
  defaultRoleProperty: {
    SUPERADMIN: {
      priority: 0,
      forSystem: 1,
      isAssigned: 1,
    },
    ADMIN: {
      priority: 1,
      forSystem: 1,
      isAssigned: 1,
    },
    EDITOR: {
      priority: 2,
      forSystem: 1,
      isAssigned: 1,
    },
    AUTHOR: {
      priority: 3,
      forSystem: 1,
      isAssigned: 1,
    },
    USER: {
      priority: 99,
      forSystem: 0,
      isAssigned: 1,
    },
  },

  /**
   * Helper utility to get all supported roles in the system
   */
  getAllRoles() {
    return Object.keys(this.defaultRoleProperty);
  },

  /**
   * Helper utility to get properties assigned to specific role
   * @param {Role Name} CODE
   */
  async gettRolePrivatePayload(CODE) {
    CODE = CODE.toUpperCase();
    if (this.defaultRoleProperty[CODE]) {
      return this.defaultRoleProperty[CODE];
    } else {
      throw new ModelError(`Invalid Role. Only supported role names allowed.`, "UNPROCESSABLE_ENTITY", { name: CODE }, true, true);
    }
  },
});

module.exports = RoleEnum;
