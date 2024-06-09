const cryptoUtil = require("../utils/crypto.utils");

var jwt = require("jsonwebtoken");
const config = require("../config/config");

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
    } = data;
    let user = await User.findById(userId).populate("industryOccupation");
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

    if (!user.industryOccupation) {
      user.industryOccupation = updatedIndustryOccupation._id;
      await user.save();
    }
    return createResponse.success(updatedIndustryOccupation);
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
    console.log("dkh222dk", "enen");
    let user = await User.findById(userId).populate("language");
    console.log("dkhdk", user);
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

module.exports.createOrUpdateUserAvailability = async (userId, data) => {
  try {
    const { slots } = data;
    let slotsInfo = await Availability.findOne({ user: userId });
    if (!slotsInfo) {
      slotsInfo = new Availability({
        user: userId,
        slots,
      });
    } else {
      slotsInfo.slots = slots;
    }
    const savedAvailability = await slotsInfo.save();
    if (savedAvailability != null)
      return createResponse.success(savedAvailability);
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
    const user = await BasicInfo.findOne({ user: userId });
    const followUser = followUserId
      ? await BasicInfo.findOne({ user: followUserId })
      : null;
    const followedByUser = followedByUserId
      ? await BasicInfo.findOne({ user: followedByUserId })
      : null;
    if (followUserId && followUser) {
      if (user.followers.includes(followUserId)) {
        const response = {
          errorCode: errorMessageConstants.CONFLICTS,
          errorMessage: "Already following",
        };
        return createResponse.error(response);
      }
      user.followers.push(followUserId);
      followUser.following.push(userId);
      await followUser.save();
    }
    if (followedByUserId && followedByUser) {
      if (user.following.includes(followedByUserId)) {
        const response = {
          errorCode: errorMessageConstants.CONFLICTS,
          errorMessage: "User is already following",
        };
        return createResponse.error(response);
      }
      followedByUser.followers.push(userId);
      if (user?.following) {
        user.following.push(followedByUserId);
      }
      await followedByUser.save();
    }

    const savedUser = await user.save();
    if (savedUser != null) return createResponse.success(savedUser);
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
      educationEntry = new Education({ degree, schoolCollege, startDate, endDate });
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



module.exports.createOrUpdateWorkExperience = async (userId, workExperienceData) => {
  try {
    const { _id, jobTitle, companyName, isCurrentlyWorking, startDate, endDate } = workExperienceData;

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
      workExperienceEntry = new WorkExperience({ jobTitle, companyName, isCurrentlyWorking, startDate, endDate });
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
