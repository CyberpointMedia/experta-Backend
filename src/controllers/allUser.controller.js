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

// Controller to get all users
exports.getAllUsers = async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const { name, phoneNo, country, role, isVerified, isBlocked } = req.query;

  try {
    const filter = { isDeleted: false };

    if (isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }

    if (phoneNo) {
      filter.phoneNo = phoneNo;
    }

    if (role) {
      const roleObj = await Role.findOne({ name: role });
      if (roleObj) {
        filter.roles = roleObj._id;
      } else {
        return res.json(
          createResponse.error({
            errorCode: errorMessageConstants.NOT_FOUND_ERROR_CODE,
            errorMessage: 'Role not found',
          })
        );
      }
    }

    const basicInfoFilter = {};
    if (name) {
      basicInfoFilter.displayName = { $regex: `.*${name}.*`, $options: 'i' }; 
    }
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'basicinfos',
          localField: 'basicInfo',
          foreignField: '_id',
          as: 'basicInfo',
        },
      },
      { $unwind: { path: '$basicInfo', preserveNullAndEmptyArrays: true } },
      { $match: { ...basicInfoFilter } },
      {
        $lookup: {
          from: 'blockedusers',
          localField: '_id',
          foreignField: 'user',
          as: 'blockInfo',
        },
      },
      {
        $addFields: {
          isBlocked: {
            $cond: [
              {
                $and: [
                  { $arrayElemAt: ['$blockInfo.block', 0] },
                  { $eq: [{ $arrayElemAt: ['$blockInfo.isDeleted', 0] }, false] },
                ],
              },
              true,
              false,
            ],
          },
        },
      },
      {
        $project: {
          password: 0,
          otp: 0,
          otpExpiry: 0,
          blockExpiry: 0,
          isDeleted: 0,
          blockInfo: 0,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];
    if (isBlocked !== undefined) {
      pipeline.push({
        $match: {
          isBlocked: isBlocked === 'true',
        },
      });
    }
    const users = await User.aggregate(pipeline);
    const totalUsers = await User.countDocuments(filter);
    const totalVerified = await User.countDocuments({ isDeleted: false, isVerified: true });
    const totalUnverified = await User.countDocuments({ isDeleted: false, isVerified: false });
    const totalPages = Math.ceil(totalUsers / limit);
    const totalBlocked = await BlockedUser.countDocuments({ block: true, isDeleted: false });
    // const totalUnblocked = await BlockedUser.countDocuments({ block: false, isDeleted: false });
    if (users.length === 0) {
      return res.json(createResponse.success(
      {
        users,
        
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalUsers,
        },
        statusSummary:{
          totalVerified,
        totalUnverified,
        totalBlocked,
        }
      }));
    }

    res.json(
      createResponse.success({
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalUsers,
        },
        statusSummary:{
          totalVerified,
        totalUnverified,
        totalBlocked,
        }
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









