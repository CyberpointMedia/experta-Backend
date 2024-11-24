const Role = require("../models/role.model");
const User = require("../models/user.model");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");

exports.createRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    
    const existingRole = await Role.findOne({ name , isDeleted:false });
    if (existingRole) {
      return res.status(409).json(createResponse.error({
        errorCode: errorMessageConstants.CONFLICTS,
        errorMessage: "Role already exists"
      }));
    }

    const role = new Role({
      name,
      permissions,
      description
    });

    const savedRole = await role.save();
    res.json(createResponse.success(savedRole));
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    const user = await User.findOne({_id:userId, isDeleted:false});
    if (!user) {
      return res.status(404).json(createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found"
      }));
    }

    const role = await Role.findOne({_id:roleId, isDeleted:false});
    if (!role) {
      return res.status(404).json(createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Role not found"
      }));
    }

    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId);
      await user.save();
    }

    res.json(createResponse.success(user));
  } catch (error) {
    console.error("Error assigning role:", error);
    res.status(500).json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({isDeleted:false});
    res.json(createResponse.success(roles));
  } catch (error) {
    console.error("Error getting roles:", error);
    res.status(500).json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};