// controllers/allUser.controller.js
const User = require('../models/user.model');
const createResponse = require('../utils/response');
const errorMessageConstants = require('../constants/error.messages');

// Controller to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpiry -blockExpiry -isDeleted');
    res.json(createResponse.success(users));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({ errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE, errorMessage: error.message }));
  }
};

// Controller to get a user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('-password -otp -otpExpiry -blockExpiry -isDeleted');
    if (!user) {
      return res.status(404).json(createResponse.error({ errorCode: 'USER_NOT_FOUND', errorMessage: 'User not found' }));
    }
    res.json(createResponse.success(user));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({ errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE, errorMessage: error.message }));
  }
};

// Controller to update a user's details
exports.updateUser = async (req, res) => {
  const { id } = req.params;          // Get the user ID from the URL parameter
  const updateData = req.body;        // The data to be updated

  // Ensure the incoming data is not empty and contains at least one valid field
  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json(createResponse.error({
      errorCode: 'BAD_REQUEST',
      errorMessage: 'No update data provided'
    }));
  }

  try {
    // Find the user by ID and update the data
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });

    // If the user does not exist, return 404
    if (!user) {
      return res.status(404).json(createResponse.error({
        errorCode: 'USER_NOT_FOUND',
        errorMessage: 'User not found'
      }));
    }

    // Return the updated user object
    res.json(createResponse.success(user));

  } catch (error) {
    console.error("Update user error:", error);
    // Internal server error response
    res.status(500).json(createResponse.error({
      errorCode: 'INTERNAL_SERVER_ERROR',
      errorMessage: error.message
    }));
  }
};


// Controller to delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json(createResponse.error({ errorCode: 'USER_NOT_FOUND', errorMessage: 'User not found' }));
    }
    res.json(createResponse.success({ message: 'User deleted successfully' }));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({ errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE, errorMessage: error.message }));
  }
};
