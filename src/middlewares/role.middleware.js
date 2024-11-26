const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
const User = require("../models/user.model");

exports.hasRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.body.user._id;
      const user = await User.findOne({_id:userId,isDeleted:false}).populate('roles');
      
      if (!user) {
        return res.status(401).json(createResponse.unauthorized(
          errorMessageConstants.UNAUTHORIZED,
          "User not found"
        ));
      }

      const userRoles = user.roles.map(role => role.name);
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json(createResponse.unauthorized(
          errorMessageConstants.UNAUTHORIZED,
          "Insufficient permissions"
        ));
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      res.status(500).json(createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message
      }));
    }
  };
};