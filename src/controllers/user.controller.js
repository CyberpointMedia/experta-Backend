const errorMessageConstants = require("../constants/error.messages");
const globalConstants = require("../constants/global-constants");

const jwtUtil = require("../utils/jwt.utils");

const authService = require("../services/auth.service");
const userService = require("../services/user.service");

const createResponse = require("../utils/response");

const { AuthenticationError } = require("../errors/custom.error");

const userDao = require("../dao/user.dao");
const BasicInfo = require("../models/basicInfo.model");
const UserAccount=require("../models/account.model");
const User=require("../models/user.model");
const mongoose=require("mongoose");


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
  let data;
  if (!!req?.file) {
    data = {
      url: req.file.location,
      type: req.file.mimetype,
    };
  }

  try {
    let basicInfoToSave = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      displayName: req.body.displayName,
      // bio: req.body.bio,
      socialLinks: req.body.socialLinks ? JSON.parse(req.body.socialLinks) : [],
      about: req.body.about,
      profilePic: data?.url,
      username: req.body.username,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
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
      level1ServiceId,
      level2ServiceId,
      level3ServiceIds,
      registrationNumber,
      achievements,
      expertise,
      certificate, // Accept certificate as a string
    } = req.body;

    if (
      (!registrationNumber || "" == registrationNumber) &&
      (!certificate || "" == certificate)
    ) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.VALIDATION_ERROR_CODE,
        errorMessage: "registrationNumber/certificate cannot be empty",
      }));
    }

    if (!expertise || !expertise.length) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.VALIDATION_ERROR_CODE,
        errorMessage: "expertise cannot be empty",
      }));
    }

    const savedIndustryOccupation =
      await userService.createOrUpdateIndustryOccupation(userId, {
        level1ServiceId,
        level2ServiceId,
        level3ServiceIds,
        registrationNumber,
        certificate, // Pass certificate as a string
        achievements,
        expertise,
      });
    res.json(savedIndustryOccupation);
  } catch (error) {
    console.log(error.message);
    const response = {
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
      if (null != data && data) {
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

// exports.createOrUpdateEducation = async (req, res) => {
//   try {
//     const userId = req.body.user._id;
//     const { education } = req.body;
//     if (!education || !education.length) {
//       res.send(createResponse.invalid("education cannot be empty"));
//       return;
//     }
//     const savedEducation = await userService.createOrUpdateEducation(userId, {
//       education,
//     });
//     return res.json(savedEducation);
//   } catch (error) {
//     console.log(error.message);
//     response = {
//       errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
//       errorMessage: error.message,
//     };
//     return res.json(createResponse.error(response));
//   }
// };

// exports.createOrUpdateWorkExperience = async (req, res) => {
//   try {
//     const userId = req.body.user._id;
//     const { workExperience } = req.body;
//     if (!workExperience || !workExperience.length) {
//       res.send(createResponse.invalid("Work Experience cannot be empty"));
//       return;
//     }
//     const savedWorkExperience = await userService.createOrUpdateWorkExperience(
//       userId,
//       workExperience
//     );
//     return res.json(savedWorkExperience);
//   } catch (error) {
//     console.log(error.message);
//     response = {
//       errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
//       errorMessage: error.message,
//     };
//     res.json(createResponse.error(response));
//   }
// };

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

exports.getEducationById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getEducationById(id)
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

exports.getAvailabilityById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserAvailabilityId(id)
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

exports.deleteAvailabilityById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .deleteAvailabilityById(id)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.UPDATE_NOT_DONE_ERROR_COde,
          errorMessage: errorMessageConstants.UNABLE_TO_DELETE_MESSAGE,
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

exports.deleteEducationById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .deleteEducationById(id)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.UPDATE_NOT_DONE_ERROR_COde,
          errorMessage: errorMessageConstants.UNABLE_TO_DELETE_MESSAGE,
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

exports.createOrUpdateAvailability = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { _id, startTime, endTime, weeklyRepeat } = req.body;

    if (!startTime || !endTime) {
      res.send(createResponse.invalid("Start time and end time are required"));
      return;
    }

    const availabilityData = { _id, startTime, endTime, weeklyRepeat };
    const savedAvailability = await userService.createOrUpdateAvailability(
      userId,
      availabilityData
    );
    return res.json(savedAvailability);
  } catch (error) {
    console.log(error.message);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return res.json(createResponse.error(response));
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
      if (null != data && data.availability) {
        res.json(createResponse.success(data.availability));
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

exports.getUserAvailabilityByExpertaId = async (req, res) => {
  const {userId} = req.params;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserAvailability(userId)
    .then((data) => {
      if (null != data && data.availability) {
        res.json(createResponse.success(data.availability));
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

exports.getUserDataByParams = async (req, res) => {
  const { userId, ownUserId } = req.params;
  console.log("userId", userId , "ownUserId", ownUserId);
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserData(userId, ownUserId)
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


exports.getUserData = async (req, res) => {
  const { userId, ownUserId } = req.body;
  console.log("userId", userId , "ownUserId", ownUserId);
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserData(userId, ownUserId)
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

exports.unfollow = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { unfollowUserId } = req.body;

    const result = await userService.unfollow(userId, unfollowUserId);
    res.json(result);
  } catch (error) {
    console.log(error.message);
    const response = {
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
      if (null != data && data) {
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

exports.getPosts = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getPosts(userId)
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

exports.getUserBySearch=async (req, res)=> {

  console.log("query",req.params);
  try {
    const { search } = req.params;

    const results = await userDao.getUserBySearch(search);
    
    res.json(createResponse.success({
      results,
      metadata: {
        count: results.length,
        originalQuery: search,
        extractedTerms: results[0]?.searchMetadata?.extractedTerms,
        matchedTerms: results[0]?.searchMetadata?.matchedTerms
      }
    }));
  } catch (error) {
    console.error("Search error:", error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: "Search failed"
    }));
  }
}




exports.getTrending = async (req, res) => {
  const userId = req.body.user._id;
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

exports.createOrUpdateEducation = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { _id, degree, schoolCollege, startDate, endDate } = req.body;

    if (!degree || !schoolCollege || !startDate || !endDate) {
      res.send(createResponse.invalid("All education fields are required"));
      return;
    }

    const educationData = { _id, degree, schoolCollege, startDate, endDate };
    const savedEducation = await userService.createOrUpdateEducation(
      userId,
      educationData
    );
    return res.json(savedEducation);
  } catch (error) {
    console.log(error.message);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return res.json(createResponse.error(response));
  }
};

exports.createOrUpdateWorkExperience = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const {
      _id,
      jobTitle,
      companyName,
      isCurrentlyWorking,
      startDate,
      endDate,
    } = req.body;

    if (!jobTitle || !companyName || !startDate) {
      res.send(
        createResponse.invalid(
          "Job title, company name, and start date are required"
        )
      );
      return;
    }

    const workExperienceData = {
      _id,
      jobTitle,
      companyName,
      isCurrentlyWorking,
      startDate,
      endDate,
    };
    const savedWorkExperience = await userService.createOrUpdateWorkExperience(
      userId,
      workExperienceData
    );
    return res.json(savedWorkExperience);
  } catch (error) {
    console.log(error.message);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return res.json(createResponse.error(response));
  }
};

exports.getWorkExperienceById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getWorkExperienceById(id)
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

exports.deleteWorkExperienceById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .deleteWorkExperienceById(id)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.UPDATE_NOT_DONE_ERROR_COde,
          errorMessage: errorMessageConstants.UNABLE_TO_DELETE_MESSAGE,
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

// master todo

exports.getIndustry = async (req, res) => {
  userDao
    .getIndustry()
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

exports.getOccupation = async (req, res) => {
  const industryId = req.params.industryId;
  if (!industryId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getOccupation(industryId)
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

exports.getUserByIndustry = async (req, res) => {
  const { level1ServiceId } = req.params;
  if (!level1ServiceId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getUserByIndustry(level1ServiceId)
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

exports.createOrUpdateIndustryOccupationMaster = async (req, res) => {
  try {
    const { name, id } = req.body;
    const icon = req?.file;
    if (!name || "" == name) {
      res.send(createResponse.invalid("name cannot be empty"));
      return;
    }

    let data;

    if (!!icon) {
      data = {
        url: req.file.location,
        type: req.file.mimetype,
      };
    }

    const savedIndustryOccupationMaster =
      await userService.createOrUpdateIndustryOccupationMaster({
        name,
        icon: data?.url,
        id,
      });
    res.json(savedIndustryOccupationMaster);
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.createOrUpdateOccupation = async (req, res) => {
  try {
    const { name, industry, id } = req.body;
    if (!name || name.trim() === "") {
      return res.json(createResponse.invalid("name cannot be empty"));
    }
    if (!industry || industry.trim() === "") {
      return res.json(createResponse.invalid("industry cannot be empty"));
    }
    const savedOccupation = await userService.createOrUpdateOccupation({
      name,
      industry,
      id,
    });
    res.json(savedOccupation);
  } catch (error) {
    console.log(error.message);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.removeConnection = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { targetUserId, action } = req.body;

    if (!["unfollow", "removeFollower"].includes(action)) {
      return res.json(
        createResponse.error({
          errorCode: errorMessageConstants.BAD_REQUEST,
          errorMessage:
            "Invalid action. Must be 'unfollow' or 'removeFollower'",
        })
      );
    }

    const result = await userService.removeConnection(
      userId,
      targetUserId,
      action
    );
    res.json(result);
  } catch (error) {
    console.log(error.message);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

// block and unBlock
exports.getAllBlockedUsers = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getAllBlockedUsers(userId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
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

exports.blockUser = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { userToBlockId } = req.body;

    const result = await userService.blockUser(userId, userToBlockId);
    res.json(result);
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { userToUnblockId } = req.body;

    const result = await userService.unblockUser(userId, userToUnblockId);
    res.json(result);
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.getProfileCompletion = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    res
      .status(400)
      .send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  userDao
    .getProfileCompletion(userId)
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

exports.shareProfile = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  try {
    const result = await userService.shareProfile(userId);
    res.json(result);
  } catch (error) {
    console.error("Error in shareProfile controller:", error);
    res.status(500).json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};


exports.getBioSuggestions = async (req, res) => {
  try {
    const { userInput } = req.body;
    if (!userInput) {
      return res.json(createResponse.invalid("User input is required"));
    }
    const suggestions =  await userDao.generateBioSuggestions(userInput);
    console.log("suggestions--> ",suggestions);
    return res.json(createResponse.success(suggestions));
  } catch (error) {
    console.error("Error in getBioSuggestions:", error);
    return res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

// username ,phone remove this from there 

exports.checkAvailability = async (req, res) => {
  try {
    const userId = req.body.user._id;
    if (!userId) {
      return res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    }
    
    const result = await userService.checkAvailability(userId);
    return res.json(result);
  } catch (error) {
    console.error("Error in checking availability:", error);
    return res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.changeUsername = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { newUsername } = req.body;

    if (!newUsername) {
      return res.json(createResponse.invalid("New username is required"));
    }

    const result = await userService.changeUsername(userId, newUsername);
    return res.json(result);
  } catch (error) {
    console.error("Error in changing username:", error);
    return res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.body.user?._id; // Optional user ID to exclude current user

    if (!username) {
      return res.json(createResponse.invalid("Username is required"));
    }
    const result = await userService.checkUsernameAvailability(userId, username);
    return res.json(result);
  } catch (error) {
    console.error("Error in checking username availability:", error);
    return res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};


exports.updateUserBio= async (req, res) => {
  const userId = req.body.user._id;
  const { bio } = req.body;

  if (!userId) {
    return res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
  }

  try {
    const user = await User.findOne({ _id: userId, isDeleted: false }).populate("basicInfo");
    
    if (!user || !user.basicInfo) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User or BasicInfo not found"
      }));
    }

    user.basicInfo.bio = bio;
    await user.basicInfo.save();

    return res.json(createResponse.success(user.basicInfo));
  } catch (error) {
    console.error("Error updating bio:", error);
    return res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.getUserBio = async (req, res) => {
  const userId = req.body.user._id;
  
  if (!userId) {
    return res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
  }

  try {
    const user = await User.findOne({ _id: userId, isDeleted: false })
      .populate("basicInfo")
      .select("basicInfo");

    if (!user || !user.basicInfo) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Bio not found"
      }));
    }

    return res.json(createResponse.success({ bio: user.basicInfo.bio }));
  } catch (error) {
    console.error("Error getting bio:", error);
    return res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.deleteAccount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.body.user._id;
    
    const user = await User.findOne({ _id: userId, isDeleted: false }).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found"
      }));
    }

    await userDao.deleteUserAndAssociatedData(userId, user, session);
    await session.commitTransaction();

    res.json(createResponse.success({ message: "Account deleted successfully" }));
  } catch (error) {
    await session.abortTransaction();
    console.error("Delete account error:", error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE, 
      errorMessage: error.message
    }));
  } finally {
    session.endSession();
  }
};

exports.getUserByServiceLevel = async (req, res) => {
  const { serviceId, level } = req.params;
  
  if (!serviceId || !level) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }

  const levelNum = parseInt(level);
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 3) {
    res.send(createResponse.invalid("Invalid service level. Must be 1, 2, or 3"));
    return;
  }

  try {
    const users = await userDao.getUserByServiceLevel(serviceId, levelNum);
    
    if (users && users.length > 0) {
      res.json(createResponse.success(users));
    } else {
      res.json(createResponse.success([], "No users found for this service level"));
    }
  } catch (err) {
    console.error(err.message);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: err.message,
    }));
  }
};