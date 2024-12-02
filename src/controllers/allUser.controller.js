// controllers/allUser.controller.js
const User = require('../models/user.model');
const createResponse = require('../utils/response');
const errorMessageConstants = require('../constants/error.messages');

//controller to create new user
exports.createUser = async (req, res) => {
  const { phoneNo, email, firstName, lastName, roles } = req.body;
  try {
    const user = new User({
      phoneNo,
      email,
      roles,
      basicInfo: {
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName
      }
    });
    await user.save();
    res.json(createResponse.success(user));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({ errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE, errorMessage: error.message }));
  }
};

// Controller to get all users
exports.getAllUsers = async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const { name, phoneNo, country, role } = req.query;
  try {

    const filter = { isDeleted: false };
    if (phoneNo) {
      filter.phoneNo = phoneNo;
    }
    if (role) {
      filter.roles = role;
    }
    const basicInfoFilter = {};
    if (name) {
      basicInfoFilter.displayName = { $regex: name, $options: 'i' };
    }

    const users = await User.find({ isDeleted: false })
      .populate({
        path: 'basicInfo',
        match: basicInfoFilter,
      })
      .skip(skip)
      .limit(limit)
      .select('-password -otp -otpExpiry -blockExpiry -isDeleted')
      .exec();

    const filteredUsers = users.filter((user) => user.basicInfo);
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const totalPages = Math.ceil(totalUsers / limit);

    if (!users || users.length === 0) {
      return res.json(createResponse.success([], "No users found"));
    }
    res.json(createResponse.success({
      users: filteredUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalUsers
      }
    }));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message || 'An error occurred while fetching users'
    }));
  }
};

// Controller to get a user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id, isDeleted: false })
      .select('-password -otp -otpExpiry -blockExpiry -isDeleted');
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
  const { id } = req.params;
  const updateData = req.body;

  // Ensure the incoming data is not empty and contains at least one valid field
  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json(createResponse.error({
      errorCode: 'BAD_REQUEST',
      errorMessage: 'No update data provided'
    }));
  }

  try {
    const user = await User.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true });

    if (!user) {
      return res.status(404).json(createResponse.error({
        errorCode: 'USER_NOT_FOUND',
        errorMessage: 'User not found'
      }));
    }
    res.json(createResponse.success(user));

  } catch (error) {
    console.error("Update user error:", error);
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
    const user = await User.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });
    if (!user) {
      return res.status(404).json(createResponse.error({ errorCode: 'USER_NOT_FOUND', errorMessage: 'User not found' }));
    }
    res.json(createResponse.success({ message: 'User deleted successfully' }));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({ errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE, errorMessage: error.message }));
  }
};
