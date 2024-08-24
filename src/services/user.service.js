const cryptoUtil = require("../utils/crypto.utils");

var jwt = require("jsonwebtoken");
const config = require("../config/config");
const mongoose = require("mongoose");

const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");

const customError = require("../errors/custom.error");
const globalConstants = require("../constants/global-constants");

const jwtUtil = require("../utils/jwt.utils");
const authUtil = require("../utils/auth.utils");
const User = require("../models/user.model");
const { AuthenticationError } = require("../errors/custom.error");
const IndustryOccupation = require("../models/industryOccupation.model");
const Expertise = require("../models/expertise.model");

const Education = require("../models/education.model");
const WorkExperience = require("../models/workExperience.model");
const BasicInfo = require("../models/basicInfo.model");
const About = require("../models/about.model");
const Interest = require("../models/interest.model");
const languageItemsModel = require("../models/languageItems.model");
const Languages = require("../models/languages.model");
const Availability = require("../models/availability.model");
const Pricing = require("../models/pricing.model");
const UserAccount = require("../models/account.model");
const IndustryModel = require("../models/industry.model");
const OccupationModel = require("../models/occupation.model");

module.exports.createOrUpdateIndustryOccupation = async function (
  userId,
  data
) {
  try {
    const {
      industry,
      occupation,
      registrationNumber,
      certificate,
      achievements,
      expertise,
    } = data;
    let user = await User.findById(userId).populate(
      "industryOccupation expertise"
    );
    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }
    let where = {};
    if (user.industryOccupation) where._id = user.industryOccupation;

    let updatedIndustryOccupation = await IndustryOccupation.findOneAndUpdate(
      where,
      {
        $set: {
          industry,
          occupation,
          registrationNumber,
          certificate,
          achievements,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    let whereExpertise = {};
    if (user.expertise) where._id = user.expertise;

    let updatedExpertise = await Expertise.findOneAndUpdate(
      whereExpertise,
      { $set: { expertise: expertise } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        select: "expertise",
      }
    );

    if (!user.expertise) {
      user.expertise = updatedExpertise._id;
      await user.save();
    }

    if (!user.industryOccupation) {
      user.industryOccupation = updatedIndustryOccupation._id;
      await user.save();
    }

    return createResponse.addSuccess(
      updatedIndustryOccupation,
      updatedExpertise.expertise
    );
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.createBasicInfo = async function (userId, basicInfoToSave) {
  try {
    let user = await User.findById(userId).populate("basicInfo");

    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }

    let where = {};
    if (user.basicInfo) where._id = user.basicInfo;
    let updatedBasicInfo = await BasicInfo.findOneAndUpdate(
      where,
      { $set: basicInfoToSave },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!user.basicInfo) {
      user.basicInfo = updatedBasicInfo._id;
      await user.save();
    }

    return createResponse.success(updatedBasicInfo);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.createOrUpdateExpertise = async function (
  userId,
  expertiseToSave
) {
  try {
    let user = await User.findById(userId).populate("expertise");

    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }

    let where = {};
    if (user.expertise) where._id = user.expertise;

    let updatedExpertise = await Expertise.findOneAndUpdate(
      where,
      { $set: { expertise: expertiseToSave } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!user.expertise) {
      user.expertise = updatedExpertise._id;
      await user.save();
    }

    return createResponse.success(updatedExpertise);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

// module.exports.createOrUpdateEducation = async (userId, data) => {
//   try {
//     const { education } = data;
//     let user = await User.findById(userId).populate("basicInfo");
//     if (!user) {
//       const response = {
//         errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
//         errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
//       };
//       return createResponse.error(response);
//     }
//     let where = {};
//     if (user.education) where._id = user.education;
//     let educationInfo = await Education.findOneAndUpdate(
//       where,
//       { $set: { education: education } },
//       { new: true, upsert: true, setDefaultsOnInsert: true }
//     );
//     if (!user.education) {
//       user.education = educationInfo._id;
//       await user.save();
//     }
//     return createResponse.success(educationInfo);
//   } catch (error) {
//     console.log("error", error);
//     throw new Error(error.message);
//   }
// };

// module.exports.createOrUpdateWorkExperience = async function (
//   userId,
//   workExperienceToSave
// ) {
//   try {
//     let user = await User.findById(userId).populate("workExperience");
//     if (!user) {
//       const response = {
//         errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
//         errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
//       };
//       return createResponse.error(response);
//     }

//     console.log("user", user);

//     let where = {};
//     if (user.workExperience) where._id = user.workExperience;

//     let updatedWorkExperience = await WorkExperience.findOneAndUpdate(
//       where,
//       { $set: { workExperience: workExperienceToSave } },
//       { new: true, upsert: true, setDefaultsOnInsert: true }
//     );

//     if (!user.workExperience) {
//       user.workExperience = updatedWorkExperience._id;
//       await user.save();
//     }

//     return createResponse.success(updatedWorkExperience);
//   } catch (error) {
//     console.error("Error:", error);
//     const response = {
//       errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
//       errorMessage: error.message,
//     };
//     return createResponse.error(response);
//   }
// };

module.exports.createOrUpdateAbout = async (userId, data) => {
  try {
    const { about } = data;
    let aboutInfo = await About.findOne({ user: userId });
    if (!aboutInfo) {
      aboutInfo = new About({
        user: userId,
        about,
      });
    } else {
      aboutInfo.about = about || aboutInfo.about;
    }
    const savedAbout = await aboutInfo.save();
    if (savedAbout != null) return createResponse.success(savedAbout);
    else {
      response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};

module.exports.createOrUpdateUserInterest = async function (
  userId,
  interestsToSave
) {
  try {
    let user = await User.findById(userId).populate("intereset");
    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }
    let where = {};
    if (user.intereset) where._id = user.intereset;
    let updatedInterests = await Interest.findOneAndUpdate(
      where,
      { $set: { intereset: interestsToSave } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!user.intereset) {
      user.intereset = updatedInterests._id;
      await user.save();
    }

    return createResponse.success(updatedInterests);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.createOrUpdateUserLanguage = async function (
  userId,
  languageToSave
) {
  try {
    let user = await User.findById(userId).populate("language");
    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }
    let where = {};
    if (user.language) where._id = user.language;

    let updatedLanguage = await Languages.findOneAndUpdate(
      where,
      { $set: { language: languageToSave } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!user.language) {
      user.language = updatedLanguage._id;
      await user.save();
    }

    return createResponse.success(updatedLanguage);
  } catch (error) {
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

/// pricing and availability

module.exports.createOrUpdateAvailability = async (
  userId,
  availabilityData
) => {
  try {
    const { _id, startTime, endTime, weeklyRepeat } = availabilityData;

    let user = await User.findById(userId);
    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }

    let availabilityEntry;
    if (_id) {
      availabilityEntry = await Availability.findByIdAndUpdate(
        _id,
        { startTime, endTime, weeklyRepeat },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      availabilityEntry = new Availability({
        startTime,
        endTime,
        weeklyRepeat,
      });
      await availabilityEntry.save();

      if (!Array.isArray(user.availability)) {
        user.availability = [];
      }
      user.availability.push(availabilityEntry._id);
      await user.save();
    }
    return createResponse.success(availabilityEntry);
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};

module.exports.createOrUpdateUserPricing = async function (
  userId,
  pricingToSave
) {
  try {
    let user = await User.findById(userId).populate("pricing");
    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }
    let where = {};
    if (user.pricing) where._id = user.pricing;
    let updatedPricing = await Pricing.findOneAndUpdate(
      where,
      { $set: pricingToSave },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!user.pricing) {
      user.pricing = updatedPricing._id;
      await user.save();
    }
    return createResponse.success(updatedPricing);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.accountSetting = async (userId, data) => {
  try {
    const { username, dateOfBirth, gender } = data;
    const updatedAccountInfo = await UserAccount.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          user: userId,
          username,
          ...(dateOfBirth && { dateOfBirth }),
          ...(gender && { gender }),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    if (updatedAccountInfo) {
      return createResponse.success(updatedAccountInfo);
    } else {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};

module.exports.addFollowerOrFollowing = async (userId, data) => {
  try {
    const { followUserId, followedByUserId } = data;

    // Find the user and their basic info
    const user = await User.findById(userId).populate("basicInfo");
    if (!user || !user.basicInfo) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User or BasicInfo not found",
      });
    }

    // Find the follow user and their basic info
    const followUser = followUserId
      ? await User.findById(followUserId).populate("basicInfo")
      : null;

    // Find the followed by user and their basic info
    const followedByUser = followedByUserId
      ? await User.findById(followedByUserId).populate("basicInfo")
      : null;

    if (followUserId && followUser && followUser.basicInfo) {
      if (user.basicInfo.followers.includes(followUserId)) {
        return createResponse.error({
          errorCode: errorMessageConstants.CONFLICTS,
          errorMessage: "Already following",
        });
      }
      user.basicInfo.followers.push(followUserId);
      followUser.basicInfo.following.push(userId);
      await followUser.basicInfo.save();
    }

    if (followedByUserId && followedByUser && followedByUser.basicInfo) {
      if (user.basicInfo.following.includes(followedByUserId)) {
        return createResponse.error({
          errorCode: errorMessageConstants.CONFLICTS,
          errorMessage: "User is already following",
        });
      }
      followedByUser.basicInfo.followers.push(userId);
      user.basicInfo.following.push(followedByUserId);
      await followedByUser.basicInfo.save();
    }

    const savedBasicInfo = await user.basicInfo.save();
    if (savedBasicInfo) {
      return createResponse.success(savedBasicInfo);
    } else {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      });
    }
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};

module.exports.unfollow = async (userId, unfollowUserId) => {
  try {
    // Find the user and their basic info
    const user = await User.findById(userId).populate("basicInfo");
    if (!user || !user.basicInfo) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User or BasicInfo not found",
      });
    }

    // Find the user to unfollow and their basic info
    const unfollowUser = await User.findById(unfollowUserId).populate(
      "basicInfo"
    );
    if (!unfollowUser || !unfollowUser.basicInfo) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User to unfollow not found",
      });
    }

    // Check if the user is actually following the unfollowUser
    if (!user.basicInfo.following.includes(unfollowUserId)) {
      return createResponse.error({
        errorCode: errorMessageConstants.CONFLICTS,
        errorMessage: "You are not following this user",
      });
    }

    // Remove unfollowUserId from user's following list
    user.basicInfo.following = user.basicInfo.following.filter(
      (id) => id.toString() !== unfollowUserId
    );

    // Remove userId from unfollowUser's followers list
    unfollowUser.basicInfo.followers = unfollowUser.basicInfo.followers.filter(
      (id) => id.toString() !== userId
    );

    // Save changes
    await user.basicInfo.save();
    await unfollowUser.basicInfo.save();
    return createResponse.success(user.basicInfo);
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};
module.exports.createOrUpdateEducation = async (userId, educationData) => {
  try {
    const { _id, degree, schoolCollege, startDate, endDate } = educationData;

    let user = await User.findById(userId);
    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }

    console.log("user", user);

    let educationEntry;
    if (_id) {
      educationEntry = await Education.findByIdAndUpdate(
        _id,
        { degree, schoolCollege, startDate, endDate },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      educationEntry = new Education({
        degree,
        schoolCollege,
        startDate,
        endDate,
      });
      await educationEntry.save();
      console.log("New education entry created:", educationEntry);

      if (!Array.isArray(user.education)) {
        user.education = [];
      }
      user.education.push(educationEntry._id);
      await user.save();
      console.log("Updated user education array:", user.education);
    }
    return createResponse.success(educationEntry);
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};

module.exports.createOrUpdateWorkExperience = async (
  userId,
  workExperienceData
) => {
  try {
    const {
      _id,
      jobTitle,
      companyName,
      isCurrentlyWorking,
      startDate,
      endDate,
    } = workExperienceData;

    let user = await User.findById(userId);
    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }

    console.log("User found:", user);

    let workExperienceEntry;
    if (_id) {
      // Update existing work experience entry
      workExperienceEntry = await WorkExperience.findByIdAndUpdate(
        _id,
        { jobTitle, companyName, isCurrentlyWorking, startDate, endDate },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      // Create new work experience entry
      workExperienceEntry = new WorkExperience({
        jobTitle,
        companyName,
        isCurrentlyWorking,
        startDate,
        endDate,
      });
      await workExperienceEntry.save();
      console.log("New work experience entry created:", workExperienceEntry);

      // Update user's work experience reference
      if (!Array.isArray(user.workExperience)) {
        user.workExperience = [];
      }
      user.workExperience.push(workExperienceEntry._id);
      await user.save();
      console.log("Updated user work experience array:", user.workExperience);
    }

    return createResponse.success(workExperienceEntry);
  } catch (error) {
    console.log("Error:", error);
    throw new Error(error.message);
  }
};

module.exports.createOrUpdateIndustryOccupationMaster = async function (data) {
  try {
    const { name, icon, id } = data;

    let updatedIndustryMaster = await IndustryModel.findOneAndUpdate(
      { _id: id ?? new mongoose.Types.ObjectId() },
      {
        $set: {
          name,
          icon,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return createResponse.success(updatedIndustryMaster);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.createOrUpdateOccupation = async ({ name, industry, id }) => {
  try {
    let updatedOccupationMaster = await OccupationModel.findOneAndUpdate(
      { _id: id ?? new mongoose.Types.ObjectId() },
      {
        $set: {
          name,
          industry,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return createResponse.success(updatedOccupationMaster);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.removeConnection = async (userId, targetUserId, action) => {
  try {
    // Find the current user and their basic info
    const user = await User.findById(userId).populate("basicInfo");
    if (!user || !user.basicInfo) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User or BasicInfo not found",
      });
    }

    // Find the target user and their basic info
    const targetUser = await User.findById(targetUserId).populate("basicInfo");
    if (!targetUser || !targetUser.basicInfo) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Target user not found",
      });
    }

    if (action === "unfollow") {
      // Check if the user is actually following the target user
      if (!user.basicInfo.following.includes(targetUserId)) {
        return createResponse.error({
          errorCode: errorMessageConstants.CONFLICTS,
          errorMessage: "You are not following this user",
        });
      }

      // Remove targetUserId from user's following list
      user.basicInfo.following = user.basicInfo.following.filter(
        (id) => id.toString() !== targetUserId
      );

      // Remove userId from target user's followers list
      targetUser.basicInfo.followers = targetUser.basicInfo.followers.filter(
        (id) => id.toString() !== userId
      );
    } else if (action === "removeFollower") {
      // Check if the target user is actually following the current user
      if (!user.basicInfo.followers.includes(targetUserId)) {
        return createResponse.error({
          errorCode: errorMessageConstants.CONFLICTS,
          errorMessage: "This user is not following you",
        });
      }

      // Remove targetUserId from user's followers list
      user.basicInfo.followers = user.basicInfo.followers.filter(
        (id) => id.toString() !== targetUserId
      );

      // Remove userId from target user's following list
      targetUser.basicInfo.following = targetUser.basicInfo.following.filter(
        (id) => id.toString() !== userId
      );
    }

    // Save changes
    await user.basicInfo.save();
    await targetUser.basicInfo.save();

    return createResponse.success(user.basicInfo);
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};

// block

module.exports.blockUser = async (userId, userToBlockId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found",
      });
    }

    if (user.blockedUsers.includes(userToBlockId)) {
      return createResponse.error({
        errorCode: errorMessageConstants.CONFLICTS,
        errorMessage: "User is already blocked",
      });
    }

    user.blockedUsers.push(userToBlockId);
    const savedUser = await user.save();

    if (savedUser) {
      return createResponse.success(savedUser);
    } else {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      });
    }
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};

module.exports.unblockUser = async (userId, userToUnblockId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found",
      });
    }

    if (!user.blockedUsers.includes(userToUnblockId)) {
      return createResponse.error({
        errorCode: errorMessageConstants.CONFLICTS,
        errorMessage: "User is not blocked",
      });
    }

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== userToUnblockId
    );
    const savedUser = await user.save();

    if (savedUser) {
      return createResponse.success(savedUser);
    } else {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      });
    }
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};
