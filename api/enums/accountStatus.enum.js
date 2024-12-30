/**
 * Module: AccountStatus Enum
 * Info: Manage codes for Account status
 **/

const AccountStatus = Object.freeze({
  statusCodes: {
    PENDING: "The account is pending verification. Please complete the process to activate your account.",
    VERIFIED: "The account is verified and online.",
    SUSPENDED: "The account has been suspended due to a policy violation. Please contact support.",
    BANNED: "account has been banned permanently. Please contact support.",
    DELETED: "The account is marked for deletion, and the process is underway.",
  },

  /**
   * Helper utility to get all supported Account status code
   */
  getAllStatus() {
    return Object.keys(this.statusCodes);
  },

  /**
   * Helper utility to get message by status code
   * @param {ACCOUNT Status Code} CODE
   */
  async getStatusMessage(CODE) {
    if (this.statusCodes[CODE]) {
      return this.statusCodes[CODE.toUpperCase()];
    } else {
      throw new TypeError(`Invalid account status code : ${CODE}`);
    }
  },
});

module.exports = AccountStatus;
