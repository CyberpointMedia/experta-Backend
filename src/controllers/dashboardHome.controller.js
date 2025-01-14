// controllers/dashboard.controller.js
const User = require('../models/user.model'); // Adjust the path as needed
const errorMessageConstants = require('../constants/error.messages'); 
const { paginate } = require('../middlewares/paginate.middleware');
const createResponse = require('../utils/response');
const blockedUser = require('../models/blockUser.model');
const role = require('../models/role.model');


// Controller method to get the total number of users
exports.getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({isDeleted:false});
    const lastMonthUsers = await User.find({
      isDeleted:false,
      createdAt: {
        $gt: new Date(new Date().setDate(new Date().getDate() - 30)),
        $lte: new Date()
      }
    }).countDocuments();
    const PercentageOfUser = (lastMonthUsers / totalUsers) * 100;
    res.status(200).json({
      status: 'success',
      message: 'Total number of users fetched successfully',
      data: { totalUsers , PercentageOfUser },
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
      const lastMonthVerifiedUsers = await User.find({
        isDeleted:false,
        isVerified:true,
        createdAt: {
          $gt: new Date(new Date().setDate(new Date().getDate() - 30)),
          $lte: new Date()
        }
      }).countDocuments();
      const PercentageOfVerifiedUser = (lastMonthVerifiedUsers / verifiedUsers) * 100;
      res.status(200).json({
        status: 'success',
        message: 'Total number of verified users fetched successfully',
        data: { verifiedUsers , PercentageOfVerifiedUser },
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
      const nonVerifiedUsers = await User.countDocuments({ isVerified: false , isDeleted:false });
      const lastMonthNonVerifiedUsers = await User.find({
        isDeleted:false,
        isVerified:false,
        createdAt: {
          $gt: new Date(new Date().setDate(new Date().getDate() - 30)),
          $lte: new Date()
        }
      }).countDocuments();
      const PercentageOfNonVerifiedUser = (lastMonthNonVerifiedUsers / nonVerifiedUsers) * 100;
      res.status(200).json({
        status: 'success',
        message: 'Total number of non-verified users fetched successfully',
        data: { nonVerifiedUsers , PercentageOfNonVerifiedUser },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: errorMessageConstants.SERVER_ERROR || 'Something went wrong while fetching the non-verified users.',
      });
    }
};

//get new users 
exports.getNewUsers = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    // Get the current date
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of the current month
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of the current month

    const users = await User.find({
      isDeleted: false,
      createdAt: {
        $gte: startOfMonth, 
        $lte: endOfMonth,
      },
    })
      .skip(skip)
      .limit(limit)
      .populate('basicInfo')
      .populate({
        path: 'roles',
        select : 'name' 
      })
      .populate({
        path:'block',
        model:'BlockedUser',
        match:{block:false}
      })
      .exec();

    const filteredUsers = users.filter(user => user.block !== null);

    const totalUsers = await User.countDocuments({
      isDeleted: false,
      createdAt: {
      $gte: startOfMonth,
      $lte: endOfMonth,
      }
    }).populate({
      path: 'block',
      model: 'BlockedUser',
      match: { block: false },
    })
    .exec();

    const totalPages = Math.ceil(filteredUsers.length / limit);
    
    if (filteredUsers.length === 0) {
      return res.json(createResponse.success([], "No new users found for this month"));
    }
    res.json(createResponse.success({
      users,
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
      errorMessage: error.message || 'An error occurred while fetching new users'
    }));
  }
};
