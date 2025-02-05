const cryptoUtil = require("../utils/crypto.utils");
const { generateQRCode } = require("../utils/qrCode.utils");

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
const userDao=require("../dao/user.dao");
const Service =require("../models/service.model");

module.exports.createOrUpdateIndustryOccupation = async function (userId, data) { 
  try {
    const {
      level1ServiceId,  
      level2ServiceId,  
      level3ServiceIds, 
      registrationNumber,
      certificate, // Accept certificate as a string
      achievements,
      expertise,
    } = data;
    
    let user = await User.findOne({_id: userId, isDeleted: false})
      .populate("industryOccupation expertise");
    
    if (!user) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      });
    }
    console.log("level1ServiceId--> ", level1ServiceId,
      level2ServiceId,
      level3ServiceIds,)
    const level1Service = await Service.findOne({
      _id: level1ServiceId,
      level: 1,
      isDeleted: false
    });

    if (!level1Service) {
      throw new Error('Invalid Level 1 service selection');
    }

    const level2Service = await Service.findOne({
      _id: level2ServiceId,
      level: 2,
      parent: level1ServiceId,
      isDeleted: false
    });

    if (!level2Service) {
      throw new Error('Invalid Level 2 service selection');
    }

    let validatedLevel3Ids = [];
    console.log("level3ServiceIds--> ",level3ServiceIds.length)
    if (Array.isArray(level3ServiceIds) && level3ServiceIds.length > 0) {
      validatedLevel3Ids = await Service.find({
        _id:  level3ServiceIds[0],
        level: 3,
        parent: level2ServiceId,
        isDeleted: false
      }).distinct('_id');
      console.log("validatedLevel3Ids--> ",validatedLevel3Ids,level3ServiceIds[0]);
      if (validatedLevel3Ids.length === 0) {
        throw new Error('No valid Level 3 services selected');
      }
    }
    let where = { isDeleted: false };
    if (user.industryOccupation) where._id = user.industryOccupation;

    let updatedIndustryOccupation = await IndustryOccupation.findOneAndUpdate(
      where,
      {
        $set: {
          level1Service: level1Service._id,
          level2Service: level2Service._id,
          level3Services: validatedLevel3Ids,
          registrationNumber,
          certificate, // Set certificate as a string
          achievements,
        },
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    ).populate([
      {
        path: 'level1Service',
        match: { isDeleted: false }
      },
      {
        path: 'level2Service',
        match: { isDeleted: false }
      },
      {
        path: 'level3Services',
        match: { isDeleted: false }
      }
    ]);

    let whereExpertise = { isDeleted: false };
    if (user.expertise) whereExpertise._id = user.expertise;

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
    }
    if (!user.industryOccupation) {
      user.industryOccupation = updatedIndustryOccupation._id;
    }
    await user.save();

    return createResponse.addSuccess(
      updatedIndustryOccupation,
      updatedExpertise.expertise
    );
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
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

    let socialLinks = [];
    if (basicInfoToSave.socialLinks && Array.isArray(basicInfoToSave.socialLinks)) {
      socialLinks = basicInfoToSave.socialLinks;
    }

    const {
      facebook,
      twitter,
      instagram,
      linkedin,
      ...otherBasicInfo
    } = basicInfoToSave;

    const updatedBasicInfo = {
      ...otherBasicInfo,
      socialLinks
    };

    let where = {};
    if (user.basicInfo) where._id = user.basicInfo;

    let savedBasicInfo = await BasicInfo.findOneAndUpdate(
      where,
      { $set: updatedBasicInfo },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!user.basicInfo) {
      user.basicInfo = savedBasicInfo._id;
      await user.save();
    }

    return createResponse.success(savedBasicInfo);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.createOrUpdateExpertise = async function (userId, expertiseToSave) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find user and populate expertise
    let user = await User.findOne({_id:userId,isDeleted:false})
      .populate("expertise")
      .session(session);

      console.log("user--> ",user);

    if (!user) {
      await session.abortTransaction();
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      });
    }

    let updatedExpertise;

    // If user already has expertise
    if (user.expertise) {
      // Delete existing expertise document
      console.log("user.expertise._id--> ",user.expertise._id);
      await Expertise.findOneAndDelete({ _id: user.expertise._id, isDeleted: false }).session(session);      
      // Create new expertise document
      updatedExpertise = new Expertise({
        expertise: expertiseToSave
      });
      await updatedExpertise.save({ session });
      
      // Update user's expertise reference
      user.expertise = updatedExpertise._id;
      await user.save({ session });
    } else {
      // First time user - create new expertise
      updatedExpertise = new Expertise({
        expertise: expertiseToSave
      });
      await updatedExpertise.save({ session });

      // Link the new expertise to the user
      user.expertise = updatedExpertise._id;
      await user.save({ session });
    }

    // Populate expertise data
    const populatedExpertise = await Expertise.findOne({_id:updatedExpertise._id, isDeleted: false})
      .populate('expertise', 'name')
      .session(session);

    await session.commitTransaction();
    return createResponse.success(populatedExpertise);

  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createOrUpdateExpertise:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
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
    let aboutInfo = await About.findOne({ user: userId , isDeleted: false});
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

module.exports.createOrUpdateUserInterest = async function (userId, interestsToSave) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({_id:userId,isDeleted:false})
      .populate("intereset")
      .session(session);

    if (!user) {
      await session.abortTransaction();
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      });
    }

    let updatedInterests;

    // If user already has interests
    if (user.intereset) {
      // Delete existing interests
      await Interest.findOneAndDelete({_id:user.intereset._id,isDeleted:false}).session(session);
      
      // Create new interests document
      updatedInterests = new Interest({
        intereset: interestsToSave
      });
      await updatedInterests.save({ session });
      
      // Update user's interest reference
      user.intereset = updatedInterests._id;
      await user.save({ session });
    } else {
      // First time user - create new interests
      updatedInterests = new Interest({
        intereset: interestsToSave
      });
      await updatedInterests.save({ session });

      // Link new interests to user
      user.intereset = updatedInterests._id;
      await user.save({ session });
    }

    // Populate and return complete data
    const populatedInterests = await Interest.findOne({_id:updatedInterests._id,isDeleted:false})
      .populate('intereset', 'name')
      .session(session);

    await session.commitTransaction();
    return createResponse.success(populatedInterests);

  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createOrUpdateUserInterest:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports.createOrUpdateUserLanguage = async function (userId, languageToSave) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({_id:userId,isDeleted:false})
      .populate("language")
      .session(session);

    if (!user) {
      await session.abortTransaction();
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      });
    }

    let updatedLanguage;

    // If user already has languages
    if (user.language) {
      // Delete existing language document
      await Languages.findOneAndDelete({_id:user.language._id,isDeleted:false}).session(session);
      
      // Create new language document
      updatedLanguage = new Languages({
        language: languageToSave
      });
      await updatedLanguage.save({ session });
      
      // Update user's language reference
      user.language = updatedLanguage._id;
      await user.save({ session });
    } else {
      // First time user - create new language document
      updatedLanguage = new Languages({
        language: languageToSave
      });
      await updatedLanguage.save({ session });

      // Link new language to user
      user.language = updatedLanguage._id;
      await user.save({ session });
    }

    // Populate and return complete data
    const populatedLanguage = await Languages.findOne({_id:updatedLanguage._id,isDeleted:false})
      .populate('language', 'name')
      .session(session);

    await session.commitTransaction();
    return createResponse.success(populatedLanguage);

  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createOrUpdateUserLanguage:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
  }
};

/// pricing and availability

module.exports.createOrUpdateAvailability = async (
  userId,
  availabilityData
) => {
  try {
    const { _id, startTime, endTime, weeklyRepeat } = availabilityData;

    let user = await User.findOne({_id:userId,isDeleted:false});
    if (!user) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      };
      return createResponse.error(response);
    }

    let availabilityEntry;
    if (_id) {
      availabilityEntry = await Availability.findOneAndUpdate(
        {_id:_id,isDeleted:false},
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

module.exports.createOrUpdateUserPricing = async function (userId, pricingToSave) {
  try {
    let user = await User.findOne({ 
      _id: userId, 
      isDeleted: false 
    }).populate("pricing");

    if (!user) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
      });
    }

    let updatedPricing;

    if (user.pricing) {
      updatedPricing = await Pricing.findOneAndUpdate(
        { _id: user.pricing._id },
        { $set: pricingToSave },
        { new: true }
      );
    } else {
      updatedPricing = await Pricing.create({
        ...pricingToSave,
      });

      user.pricing = updatedPricing._id;
      await user.save();
    }
    return createResponse.success(updatedPricing);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

module.exports.accountSetting = async (userId, data) => {
  try {
    const { username, dateOfBirth, gender } = data;
    const updatedAccountInfo = await UserAccount.findOneAndUpdate(
      { user: userId , isDeleted: false},
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
    const user = await User.findOne({_id:userId,isDeleted:false}).populate("basicInfo");
    if (!user || !user.basicInfo) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User or BasicInfo not found",
      });
    }

    // Find the follow user and their basic info
    const followUser = followUserId
      ? await User.findOne({_id:followUserId, isDeleted:false}).populate("basicInfo")
      : null;

    // Find the followed by user and their basic info
    const followedByUser = followedByUserId
      ? await User.findOne({_id:followedByUserId,isDeleted:false}).populate("basicInfo")
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
    const user = await User.findOne({_id:userId,isDeleted:false}).populate("basicInfo");
    if (!user || !user.basicInfo) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User or BasicInfo not found",
      });
    }

    // Find the user to unfollow and their basic info
    const unfollowUser = await User.findOne({_id:unfollowUserId,isDeleted:false}).populate(
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

    let user = await User.findOne({_id:userId,isDeleted:false});
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
      educationEntry = await Education.findOneAndUpdate(
        {_id:_id,isDeleted:false},
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

    let user = await User.findOne({_id:userId,isDeleted:false});
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
      workExperienceEntry = await WorkExperience.findOneAndUpdate(
        {_id:_id,isDeleted:false},
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
      { _id: id ?? new mongoose.Types.ObjectId() , isDeleted: false},
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
      { _id: id ?? new mongoose.Types.ObjectId() , isDeleted: false},
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
    const user = await User.findOne({_id:userId,isDeleted:false}).populate("basicInfo");
    if (!user || !user.basicInfo) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User or BasicInfo not found",
      });
    }

    // Find the target user and their basic info
    const targetUser = await User.findOne({_id:targetUserId,isDeleted:false}).populate("basicInfo");
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
    const user = await User.findOne({_id:userId,isDeleted:false});
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
    const user = await User.findOne({_id:userId,isDeleted:false});
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


module.exports.shareProfile = async function (userId) {
  try {
    const user = await User.findOne({_id:userId,isDeleted:false}).populate("basicInfo").populate({
      path: "industryOccupation",
      populate: [
        { path: "level1Service", model: "Service" },
        { path: "level2Service", model: "Service" },
        { path: "level3Services", model: "Service" },
      ],
    });
    if (!user) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.DATA_NOT_FOUND,
      });
    }

    const profileData = {
      id: user._id,
      name: `${user.basicInfo.firstName} ${user.basicInfo.lastName}`,
      title: user.basicInfo.displayName || "User",
      profilePic:user.basicInfo.profilePic || "",
      industry:user.industryOccupation?.industry?.name,
      occupation:user.industryOccupation?.occupation?.name,
      services: {
        level1Service: user.industryOccupation?.level1Service?.name || null,
        level2Service: user.industryOccupation?.level2Service?.name || null,
        level3Services: user.industryOccupation?.level3Services?.map(
          (service) => service.name
        ) || [],
      },
    };
    const qrCode = await generateQRCode(JSON.stringify(profileData));
    user.basicInfo.qrCode = qrCode;
    await user.basicInfo.save();

    return createResponse.success({ qrCode, profileData });
  } catch (error) {
    console.error("Error sharing profile:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};


exports.checkAvailability = async function(userId) {
  try {
    const userData = await userDao.getUserDetailsForAvailability(userId);
    if (!userData) {
      throw new Error("User not found");
    }
    const result = {
      email: userData?.email ||  "",
      phoneNo: userData?.phoneNo || "",
      username: userData?.username || ""
    };
    return createResponse.success(result);
  } catch (error) {
    console.error("Error in availability service:", error);
    throw error;
  }
};

exports.changeUsername = async function(userId, newUsername) {
  try {
    const usernameExists = await userDao.checkUsernameExistsForOtherUser(userId, newUsername);
    
    if (usernameExists) {
      return createResponse.error({
        errorCode: errorMessageConstants.CONFLICTS,
        errorMessage: "Username already taken"
      });
    }

    const updatedBasicInfo = await userDao.updateUsername(userId, newUsername);
    return createResponse.success(updatedBasicInfo);
  } catch (error) {
    console.error("Error in change username service:", error);
    throw error;
  }
};

exports.checkUsernameAvailability = async function(userId, username) {
  try {
    const usernameExists = await userDao.checkUsernameExistsForOtherUser(userId, username);
    if (usernameExists) {
      return createResponse.success({
        available: false,
        message: "Username is already taken"
      });
    }
    return createResponse.success({
      available: true,
      message: "Username is available"
    });
  } catch (error) {
    console.error("Error in username availability service:", error);
    throw error;
  }
};

exports.deleteAccount = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await userDao.getUserById(userId);
    if (!user) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found"
      });
    }

    await userDao.deleteUserAndAssociatedData(userId, user, session);
    await session.commitTransaction();
    return createResponse.success({ message: "Account deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};