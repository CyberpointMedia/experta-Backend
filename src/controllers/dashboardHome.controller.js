// controllers/dashboard.controller.js
const User = require('../models/user.model'); // Adjust the path as needed
const errorMessageConstants = require('../constants/error.messages'); 

// Controller method to get the total number of users
exports.getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({isDeleted:false});
    res.status(200).json({
      status: 'success',
      message: 'Total number of users fetched successfully',
      data: { totalUsers },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: errorMessageConstants.SERVER_ERROR || 'Something went wrong while fetching the total users.',
    });
  }
};

// Controller method to get the total number of verified users
exports.getVerifiedUsers = async (req, res) => {
    try {
      const verifiedUsers = await User.countDocuments({ isVerified: true , isDeleted:false });
      res.status(200).json({
        status: 'success',
        message: 'Total number of verified users fetched successfully',
        data: { verifiedUsers },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: errorMessageConstants.SERVER_ERROR || 'Something went wrong while fetching the verified users.',
      });
    }
  };

// Controller method to get the total number of non-verified users
exports.getNonVerifiedUsers = async (req, res) => {
    try {
      const nonVerifiedUsers = await User.countDocuments({ isVerified: false , isDeleted:false }); // Count users where isVerified is false
      res.status(200).json({
        status: 'success',
        message: 'Total number of non-verified users fetched successfully',
        data: { nonVerifiedUsers },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: errorMessageConstants.SERVER_ERROR || 'Something went wrong while fetching the non-verified users.',
      });
    }
};