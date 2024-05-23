const errorMessageConstants = require("../constants/error.messages");
const globalConstants = require("../constants/global-constants");

const jwtUtil = require("../utils/jwt.utils");

const authService = require("../services/auth.service");
const userService = require("../services/user.service");

const createResponse = require("../utils/response");

const { AuthenticationError } = require("../errors/custom.error");

const userDao = require("../dao/user.dao");
const BasicInfo = require("../models/basicInfo.model");

// import { createOrUpdateIndustryOccupation } from "../services/user.service";
exports.getBasicInfo = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getBasicInfo(userId)
    .then((data) => {
      if (null != data && data.basicInfo) {
        res.json(createResponse.success(data.basicInfo));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.createBasicInfo = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  // if (!req.body.name) {
  //   res.send(createResponse.invalid("Name cannot be empty"));
  //   return;
  // }

  try {
    let basicInfoToSave = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      displayName: req.body.displayName,
      bio: req.body.bio,
      facebook: req.body.facebook,
      linkedin: req.body.linkedin,
      instagram: req.body.instagram,
      twitter: req.body.twitter,
      about: req.body.about,
    };
    const savedBasicInfo = await userService.createBasicInfo(
      userId,
      basicInfoToSave
    );
    return res.json(savedBasicInfo);
  } catch (e) {
    console.log(e);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: e,
    };
    res.json(createResponse.error(response));
  }
};

exports.createOrUpdateIndustryOccupation = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const {
      industry,
      occupation,
      registrationNumber,
      certificate,
      achievements,
    } = req.body;
    if (!industry || "" == industry) {
      res.send(createResponse.invalid("Industry cannot be empty"));
      return;
    }
    if (!occupation || "" == occupation) {
      res.send(createResponse.invalid("Occupation cannot be empty"));
      return;
    }
    if (!occupation || "" == occupation) {
      res.send(createResponse.invalid("Occupation cannot be empty"));
      return;
    }
    if (
      (!registrationNumber || "" == registrationNumber) &&
      (!certificate || "" == certificate)
    ) {
      res.send(
        createResponse.invalid("registrationNumber/certificate cannot be empty")
      );
      return;
    }

    const savedIndustryOccupation =
      await userService.createOrUpdateIndustryOccupation(userId, {
        industry,
        occupation,
        registrationNumber,
        certificate,
        achievements,
      });
    res.json(savedIndustryOccupation);
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.getIndustryOccupation = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getIndustryOccupation(userId)
    .then((data) => {
      if (null != data && data.industryOccupation) {
        res.json(createResponse.success(data.industryOccupation));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.createExpertise = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { expertise } = req.body;
    if (!expertise || !expertise.length) {
      res.send(createResponse.invalid("expertise cannot be empty"));
      return;
    }
    const savedExpertise = await userService.createOrUpdateExpertise(
      userId,
      expertise
    );
    res.json(savedExpertise);
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.getExpertise = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getExpertise(userId)
    .then((data) => {
      if (null != data && data.expertise) {
        res.json(createResponse.success(data.expertise));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.createExpertiseItem = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  if (!req.body.name) {
    res.send(createResponse.invalid("Name cannot be empty"));
    return;
  }
  try {
    userDao
      .createExpertiseItem(req.body.name)
      .then((data) => {
        if (null != data) {
          res.json(createResponse.success(data));
        } else {
          response = {
            errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
            errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
          };
          res.json(createResponse.error(response));
        }
      })
      .catch((err) => {
        console.log(err);
        response = {
          errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
          errorMessage: err,
        };
        res.json(createResponse.error(response));
      });
  } catch (e) {
    console.log(e);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: e,
    };
    res.json(createResponse.error(response));
  }
};

exports.getExpertiseItems = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getExpertiseItem(userId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.createOrUpdateEducation = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { education } = req.body;
    if (!education || !education.length) {
      res.send(createResponse.invalid("expertise cannot be empty"));
      return;
    }
    const savedEducation = await userService.createOrUpdateEducation(userId, {
      education,
    });
    return res.json(savedEducation);
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return res.json(createResponse.error(response));
  }
};

exports.createOrUpdateWorkExperience = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { workExperience } = req.body;
    if (!workExperience || !workExperience.length) {
      res.send(createResponse.invalid("Work Experience cannot be empty"));
      return;
    }
    const savedWorkExperience = await userService.createOrUpdateWorkExperience(
      userId,
      workExperience
    );
    return res.json(savedWorkExperience);
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.getWorkExperience = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getWorkExperience(userId)
    .then((data) => {
      console.log("12data", data);
      if (null != data && data.workExperience) {
        res.json(createResponse.success(data.workExperience));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};

exports.getEducation = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getEducation(userId)
    .then((data) => {
      if (null != data && data.education) {
        res.json(createResponse.success(data.education));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};

// about

exports.getUserAbout = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserAbout(userId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};

exports.createOrUpdateUserAbout = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { about } = req.body;
    if (!about || about === null) {
      res.send(createResponse.invalid("About cannot be empty"));
      return;
    }
    const savedWorkExperience = await userService.createOrUpdateAbout(userId, {
      about,
    });
    return res.json(savedWorkExperience);
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

// interest

exports.getUserInterest = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserInterest(userId)
    .then((data) => {
      if (null != data && data.intereset) {
        res.json(createResponse.success(data.intereset));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.getUserInterestItems = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserInterestItems(userId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.createInterestItem = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  if (!req.body.name) {
    res.send(createResponse.invalid("Name cannot be empty"));
    return;
  }
  try {
    userDao
      .createInterestItem(req.body.name)
      .then((data) => {
        if (null != data) {
          res.json(createResponse.success(data));
        } else {
          response = {
            errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
            errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
          };
          res.json(createResponse.error(response));
        }
      })
      .catch((err) => {
        console.log(err);
        response = {
          errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
          errorMessage: err,
        };
        res.json(createResponse.error(response));
      });
  } catch (e) {
    console.log(e);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: e,
    };
    res.json(createResponse.error(response));
  }
};

exports.createUserInterest = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { interests } = req.body;
    if (!interests || !interests.length) {
      res.send(createResponse.invalid("interests cannot be empty"));
      return;
    }
    if (interests.length > 5) {
      res.send(createResponse.invalid("interest cannot be more than 5"));
      return;
    }
    const savedInterest = await userService.createOrUpdateUserInterest(
      userId,
      interests
    );
    res.json(savedInterest);
    return;
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

// language
exports.getAllLanguages = async (req, res) => {
  userDao
    .getAllLanguages()
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.createLanguagesList = async (req, res) => {
  if (!req.body.name) {
    res.send(createResponse.invalid("Name cannot be empty"));
    return;
  }
  try {
    userDao
      .addLanguages(req.body.name)
      .then((data) => {
        if (null != data) {
          res.json(createResponse.success(data));
        } else {
          response = {
            errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
            errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
          };
          res.json(createResponse.error(response));
        }
      })
      .catch((err) => {
        console.log(err);
        response = {
          errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
          errorMessage: err,
        };
        res.json(createResponse.error(response));
      });
  } catch (e) {
    console.log(e);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: e,
    };
    res.json(createResponse.error(response));
  }
};

exports.getUserLanguages = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserLanguages(userId)
    .then((data) => {
      if (null != data && data.language) {
        res.json(createResponse.success(data.language));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.createUserLanguage = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { language } = req.body;
    if (!language || !language.length) {
      res.send(createResponse.invalid("Language cannot be empty"));
      return;
    }
    const savedLanguage = await userService.createOrUpdateUserLanguage(
      userId,
      language
    );
    res.json(savedLanguage);
    return;
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

// pricing

exports.getUserPricing = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserPricing(userId)
    .then((data) => {
      if (null != data && data.pricing) {
        res.json(createResponse.success(data.pricing));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};

exports.createOrUpdateUserPricing = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { audioCallPrice, videoCallPrice, messagePrice } = req.body;
    if (!audioCallPrice || "" == audioCallPrice) {
      res.send(createResponse.invalid("Audio call pricing cannot be empty"));
      return;
    }
    if (!videoCallPrice || "" == videoCallPrice) {
      res.send(createResponse.invalid("Video call pricing cannot be empty"));
      return;
    }

    const savedUserPricing = await userService.createOrUpdateUserPricing(
      userId,
      {
        audioCallPrice,
        videoCallPrice,
        messagePrice,
      }
    );
    res.json(savedUserPricing);
    return;
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.createOrUpdateUserAvailability = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { slots } = req.body;
    if (!userId) {
      res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
      return;
    }
    if (!slots || !slots.length) {
      res.send(createResponse.invalid("Slots availability  cannot be empty"));
      return;
    }
    const savedAvailability = await userService.createOrUpdateUserAvailability(
      userId,
      { slots }
    );
    return res.json(savedAvailability);
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.getUserAvailability = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserAvailability(userId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};

exports.getAccountSetting = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getAccountSetting(userId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};

exports.accountSetting = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const savedUserAccountSetting = await userService.accountSetting(
      userId,
      req.body
    );
    res.json(savedUserAccountSetting);
    return;
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.getUserData = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserData(userId)
    .then((data) => {
      if (null != data) {
        console.log;
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};

exports.addFollowerOrFollowing = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { followUserId, followedByUserId } = req.body;

    const savedList = await userService.addFollowerOrFollowing(userId, {
      followUserId,
      followedByUserId,
    });
    res.json(savedList);
    return;
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.getfollowersandfollowing = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .followersandfollowing(userId)
    .then(async (data) => {
      console.log("datadfsfs,following", data);
      if (null != data) {
        const followerList = await Promise.all(
          data.followers.map(async (follower) => {
            const followerUser = await BasicInfo.findOne({
              user: follower._id,
            });
            return {
              id: followerUser?._id,
              displayName: followerUser?.displayName,
              name: followerUser?.name,
            };
          })
        );
        const followingList = await Promise.all(
          data.following.map(async (following) => {
            const followingUser = await BasicInfo.findOne({
              user: following._id,
            });
            return {
              id: followingUser?._id,
              displayName: followingUser?.displayName,
              name: followingUser?.name,
            };
          })
        );
        res.json(
          createResponse.success({
            followers: followerList,
            following: followingList,
          })
        );
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.getPosts = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserData(userId)
    .then((data) => {
      if (null != data) {
        console.log;
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};

exports.getFeeds = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getFeeds(userId)
    .then((data) => {
      if (null != data) {
        console.log;
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};

exports.getPolicy = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getPolicy(userId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};


exports.searchUsersByInterest = async (req, res) => {
  const { search } = req.params;
  
  userDao
    .searchUsersByInterest(search)
    .then((data) => {
      if (null != data) {
        console.log;
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};


exports.getTrending = async (req, res) => {
  userDao
    .getTrending()
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};


exports.getCategories = async (req, res) => {
  userDao
    .getCategories()
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};