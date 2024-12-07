// controllers/allUser.controller.js
const mongoose = require("mongoose");
const User = require('../models/user.model');
const BasicInfo = require('../models/basicInfo.model');
const Role = require('../models/role.model');
const createResponse = require('../utils/response');
const BlockedUser = require("../models/blockUser.model");
const errorMessageConstants = require('../constants/error.messages');

//controller to create new user
exports.createUser = async (req, res) => {
  const { phoneNo, email, firstName, lastName, roles } = req.body;
  try {
    const basicInfo = new BasicInfo({
      displayName: `${firstName} ${lastName}`,
      firstName,
      lastName,
    });
    const savedBasicInfo = await basicInfo.save();
    const roleIds = await Role.find({ name: { $in: roles } }).select('_id');
    const blockedUser = new BlockedUser({
      block: false,
    });
    const savedBlockedUser = await blockedUser.save();
    const user = new User({
      phoneNo,
      email,
      roles: roleIds.map((role) => role._id),
      basicInfo: savedBasicInfo._id,
      block: savedBlockedUser._id,
    });

    await user.save();
    res.json(createResponse.success(user));
  } catch (error) {
    console.error(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit,skip } = req.pagination;
    const { phoneNo, status } = req.query;
    const filter = {};

    if (phoneNo) {
      filter.phoneNo = phoneNo;
    }
    if (status) {
      if (status === 'isVerified') {
        filter.isVerified = true;
        filter['blockInfo.block'] = { $ne: true };
      } else if (status === 'notVerified') {
        filter.isVerified = false;
        filter['blockInfo.block'] = { $ne: true }; 
      } else if (status === 'block') {
        filter['blockInfo.block'] = true; 
      }
    }

    const users = await User.aggregate([
      {
        $lookup: {
          from: 'blockedusers',
          localField: 'block',
          foreignField: '_id',
          as: 'blockInfo',
        },
      },
      { $unwind: { path: '$blockInfo', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          'blockInfo.block': { $ifNull: ['$blockInfo.block', false] },
        },
      },
      {
        $match: {
          ...filter,
          $or: [
            { 'blockInfo.block': { $exists: true } },
            { blockInfo: null }, 
          ],
        },
      },
      { $skip: skip },
      { $limit: parseInt(limit, 10) },
      {
        $project: {
          password: 0,
          isDeleted: 0,
        },
      },
    ]);

    // Total users count
    const totalUsers = await User.aggregate([
      {
        $lookup: {
          from: 'blockedusers',
          localField: 'block',
          foreignField: '_id',
          as: 'blockInfo',
        },
      },
      { $unwind: { path: '$blockInfo', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          'blockInfo.block': { $ifNull: ['$blockInfo.block', false] },
        },
      },
      {
        $match: {
          ...filter,
          $or: [
            { 'blockInfo.block': { $exists: true } },
            { blockInfo: null },
          ],
        },
      },
      { $count: 'totalCount' },
    ]);

    const totalUsersCount = totalUsers.length > 0 ? totalUsers[0].totalCount : 0;
    const totalPages = Math.ceil(totalUsersCount / limit);

    // Status summaries
    const totalVerified = await User.countDocuments({
      ...filter,
      isVerified: true,
    });

    const totalUnverified = await User.countDocuments({
      ...filter,
      isVerified: false,
    });

    const totalBlocked = await User.aggregate([
      {
        $lookup: {
          from: 'blockedusers',
          localField: 'block',
          foreignField: '_id',
          as: 'blockInfo',
        },
      },
      { $unwind: { path: '$blockInfo', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          ...filter,
          'blockInfo.block': true,
          'blockInfo.isDeleted': false,
        },
      },
      { $count: 'totalCount' },
    ]);

    const totalBlockedCount = totalBlocked.length > 0 ? totalBlocked[0].totalCount : 0;

    res.json(
      createResponse.success({
        message: 'Users fetched successfully',
        data: {
          users,
          pagination: {
            currentPage: parseInt(page, 10),
            totalPages,
            totalItems: totalUsersCount,
          },
          statusSummary: {
            totalVerified,
            totalUnverified,
            totalBlocked: totalBlockedCount,
          },
        },
      })
    );
  } catch (error) {
    console.error(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message || 'An error occurred while fetching users',
      })
    );
  }
};

// Controller to get a user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id, isDeleted: false })
      .populate('basicInfo')
      .populate('roles')
      .populate('education')
      .populate('industryOccupation')
      .populate('workExperience')
      .populate('intereset')
      .populate('language')
      .populate({
        path: 'expertise',
        populate: {
          path: 'expertise',
          model: 'ExpertiseItem',
        },
      })
      .populate('pricing')
      .populate('availability')
      .populate('notifications')
      .populate('blockedUsers', '-password -otp -otpExpiry -isDeleted')
      .exec();
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
  const { ids } = req.body;
  try {
    if (ids && Array.isArray(ids)) {
      // Handle multiple user deletions
      const result = await User.updateMany(
        { _id: { $in: ids }, isDeleted: false },
        { $set: { isDeleted: true } }
      );
      return res.json(createResponse.success({
        message: `${result.nModified} user(s) deleted successfully`,
      }));
    }
    // Handle single user deletion
    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json(createResponse.error({ errorCode: 'USER_NOT_FOUND', errorMessage: 'User not found' }));
    }
    res.json(createResponse.success({ message: 'User deleted successfully' }));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({ errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE, errorMessage: error.message }));
  }
};

// Controller to block a user
exports.blockStatus = async (req, res) => {
  const { userIds, block } = req.body;
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid userIds provided" },
      });
    }

    const objectIds = userIds.map(id => new mongoose.Types.ObjectId(id));

    const users = await User.find({ _id: { $in: objectIds } }, { block: 1 }).lean();
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "No users found with the provided IDs" },
      });
    }

    const blockIds = users.map(user => user.block).filter(Boolean);
    console.log("Updating BlockedUser documents:", blockIds, "Block status:", block);
    if (blockIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "No valid block references found for the provided users" },
      });
    }

    const result = await BlockedUser.updateMany(
      { _id: { $in: blockIds } },
      { $set: { block } }
    );

    console.log("Update result for BlockedUser:", result);
    if (block) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { $addToSet: { blockedUsers: { $each: userIds } } }
      );
    } else {
      await User.updateMany(
        { _id: { $in: userIds } },
        { $pull: { blockedUsers: { $in: userIds } } }
      );
    }
    return res.json({
      success: true,
      message: "Blocked user(s) updated successfully",
      modifiedCount: result.nModified,
    });
  } catch (error) {
    console.error("Error updating blocked users:", error);
    res.status(500).json(
      createResponse.error({
        errorCode: "INTERNAL_SERVER_ERROR",
        errorMessage: "An error occurred while updating blocked users",
      })
    );
  }
};









