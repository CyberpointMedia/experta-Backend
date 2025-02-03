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
const Role = require("../models/role.model");
const {
  AuthenticationError,
  ValidationError,
} = require("../errors/custom.error");
const BasicInfo = require("../models/basicInfo.model");
const BlockedUser = require("../models/blockUser.model");
const twilio = require("twilio");

const client = twilio(config.twilio.accountSid, config.twilio.twilioAuthToken);
const userDao = require("../dao/user.dao");
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RESTORE_WINDOW_DAYS = 30;
const RESTORE_WINDOW_MS = RESTORE_WINDOW_DAYS * MS_PER_DAY;
const mongoose = require("mongoose");
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports.validateUser = async function (userData) {
  try {
    const { firstName, lastName, email, phoneNo } = userData;
    const existingUser = await User.findOne({ $or: [{ email, isDeleted: false }, { phoneNo, isDeleted: false }] });
    if (existingUser) {
      const response = {
        errorCode: errorMessageConstants.CONFLICTS,
        errorMessage: "User already exists",
      };
      return createResponse.error(response);
    }
    const otp = authUtil.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // let name = firstName;
    // if (lastName) name = name + " " + lastName;
    let basicInfo = new BasicInfo({
      firstName,
      lastName,
    });
    const basicInfoDetails = await basicInfo.save();

    const blockUser = new BlockedUser({
      block: false,
    });
    const blockUserDetails = await blockUser.save();

    let user = new User({
      email,
      phoneNo,
      otp,
      otpExpiry,
      basicInfo: basicInfoDetails._id,
      block: blockUserDetails._id,
    });
    user = await user.save();
    if (phoneNo === config.test.testPhoneNo) {
      otp = config.test.testOtp;
    } else {
      await this.sendOTP(user.phoneNo, otp);
    }
    const userResponse = {
      lastName,
      firstName,
      email: user.email,
      phoneNo: user.phoneNo,
      resendCount: user.resendCount,
      otp: user.otp,
      otpExpiry: user.otpExpiry,
      block: {
        id: blockUserDetails._id,
        status: blockUserDetails.block,
      },
      isVerified: user.isVerified,
      id: user.id,
    };
    return createResponse.success(userResponse);
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};

module.exports.verifyOtp = async function (userData) {
  try {
    const { phoneNo, otp } = userData;

    if (phoneNo === config.test.testPhoneNo) {
      if (otp !== config.test.testOtp) {
        throw new customError.AuthenticationError(
          globalConstants.INVALID_USER_CODE,
          "Oops! That OTP doesn't match. Try again."
        );
      }
      let user = await User.findOne({ phoneNo, isDeleted: false });
      if (!user) {
        const blockUser = new BlockedUser({ block: false });
        const blockUserDetails = await blockUser.save();

        const basicInfo = new BasicInfo({});
        const basicInfoDetails = await basicInfo.save();

        user = new User({
          phoneNo,
          basicInfo: basicInfoDetails._id,
          block: blockUserDetails._id,
        });
      }

      user.otp = null;
      user.otpExpiry = null;
      user.isVerified = true;
      user.resendCount = 0;
      const data = await user.save();

      const finalData = {
        _id: data?.id,
        phoneNo: data?.phoneNo,
        email: data?.email || null,
      };

      const token = await jwtUtil.generateToken(finalData);
      return createResponse.success(data, token);
    }



    const user = await User.findOne({ phoneNo, isDeleted: false });
    if (!user) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "Invalid phone number."
      );
    }

    const blockUser = await BlockedUser.findOne({ user: user._id });

    if (blockUser && blockUser.block) {
      if (blockUser.blockExpiry > Date.now()) {
        const remainingTime = Math.ceil((blockUser.blockExpiry - Date.now()) / 1000 / 60);
        return createResponse.error({
          errorCode: 429,
          errorMessage: `Account blocked for ${remainingTime} minutes`,
        });
      } else {
        blockUser.block = false;
        blockUser.blockExpiry = null;
        user.resendCount = 0;
        await user.save();
      }
    }

    const now = Date.now();
    if (user.otp !== otp) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "Oops! That OTP doesn't match. Try again."
      );
    }

    if (user.otpExpiry && now > user.otpExpiry.getTime()) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "The OTP is no longer valid. Generate a new OTP to proceed."
      );
    }

    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true;
    user.resendCount = 0;
    const data = await user.save();

    const finalData = {
      _id: data?.id,
      phoneNo: data?.phoneNo,
      email: data?.email || null,
    };

    const token = await jwtUtil.generateToken(finalData);
    return createResponse.success(data, token);
  } catch (e) {
    console.log("error", e);
    if (e instanceof AuthenticationError) {
      throw e;
    } else {
      throw new Error(e.message);
    }
  }
};

module.exports.decodeToken = function (token) {
  return jwt.verify(token, config.jwt.secret, function (err, decoded) {
    if (err) return createResponse.error(errorMessageConstants.AUTH_ERROR);
    return createResponse.success(decoded);
  });
};

module.exports.login = async function (phoneNo) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let user = await User.findOne({ phoneNo });
    let otp = authUtil.generateOTP(); // Changed from const to let
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    console.log("user--> ", user);

    if (!user) {
      const blockUser = new BlockedUser({ block: false });
      const blockUserDetails = await blockUser.save({ session });
      let basicInfo = new BasicInfo({});
      const basicInfoDetails = await basicInfo.save({ session });

      // Assign a default role to the new user
      const defaultRole = await Role.findOne({ name: "user" });
      const roleIds = defaultRole ? [defaultRole._id] : [];

      user = new User({
        phoneNo,
        otp,
        otpExpiry,
        block: blockUserDetails._id,
        basicInfo: basicInfoDetails._id,
        roles: roleIds,
      });
      user = await user.save({ session });
    } else if (user.isDeleted) {
      console.log("eneter --> ", user);
      const deletedAt = user.updatedAt;
      const timeSinceDeletion = Date.now() - deletedAt;

      if (timeSinceDeletion <= RESTORE_WINDOW_MS) {
        // Within 30 days - restore account
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        user.isDeleted = false;
        console.log("user--> ", user);
        user = await userDao.restoreAccount(user, session);
      } else {
        // After 30 days - create new account
        const blockUser = new BlockedUser({ block: false });
        const blockUserDetails = await blockUser.save({ session });
        let basicInfo = new BasicInfo({});
        const basicInfoDetails = await basicInfo.save({ session });

        // Assign a default role to the new user
        const defaultRole = await Role.findOne({ name: "user" });
        const roleIds = defaultRole ? [defaultRole._id] : [];

        user = new User({
          phoneNo,
          otp,
          otpExpiry,
          block: blockUserDetails._id,
          basicInfo: basicInfoDetails._id,
          roles: roleIds,
        });
        user = await user.save({ session });
      }
    } else {
      // Existing active user - handle block status
      const blockUser = await BlockedUser.findOne({ _id: user.block }).session(session);
      if (blockUser?.block) {
        if (blockUser.blockExpiry > Date.now()) {
          const remainingTime = Math.ceil((blockUser.blockExpiry - Date.now()) / 1000 / 60);
          await session.abortTransaction();
          return createResponse.error({
            errorCode: 429,
            errorMessage: `Account blocked for ${remainingTime} minutes`,
          });
        } else {
          blockUser.block = false;
          blockUser.blockExpiry = null;
          user.resendCount = 1;
          await blockUser.save({ session });
        }
      }

      // Check if the user has roles other than "user"
      const roles = await Role.find({ _id: { $in: user.roles } }).session(session);
      const roleNames = roles.map(role => role.name);
      if (roleNames.some(role => role !== "user")) {
        await session.abortTransaction();
        return createResponse.error({
          errorCode: 403,
          errorMessage: "Account already exists. Please contact support.",
        });
      }

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user = await user.save({ session });
    }

    await session.commitTransaction();

    if (phoneNo === config.test.testPhoneNo) {
      otp = config.test.testOtp;
    } else {
      await this.sendOTP(user.phoneNo, otp);
    }

    return createResponse.success({
      phoneNo: user.phoneNo,
      resendCount: user.resendCount,
      isVerified: user.isVerified,
      id: user.id,
      otp: user?.otp,
    });

  } catch (e) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.log("error", e);
    if (e instanceof AuthenticationError) {
      throw e;
    } else {
      throw new Error(e.message);
    }
  } finally {
    session.endSession();
  }
};

module.exports.dashboardLogin = async function (phoneNo) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let user = await User.findOne({ phoneNo });
    if (!user) {
      await session.abortTransaction();
      return createResponse.error({
        errorCode: 404,
        errorMessage: "User not found",
      });
    }

    // Check if the user has the required role
    const roles = await Role.find({ _id: { $in: user.roles } });
    const roleNames = roles.map(role => role.name);
    console.log("roleNames", roleNames);
    const allowedRoles = ["admin", "editor", "author", "superAdmin"];
    const hasRequiredRole = roleNames.some(role => allowedRoles.includes(role));
    console.log("hasRequiredRole", hasRequiredRole);

    if (!hasRequiredRole) {
      await session.abortTransaction();
      return createResponse.error({
        errorCode: 403,
        errorMessage: "You do not have access to the dashboard",
      });
    }

    const otp = authUtil.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    if (user.isDeleted) {
      const deletedAt = user.updatedAt;
      const timeSinceDeletion = Date.now() - deletedAt;

      if (timeSinceDeletion <= RESTORE_WINDOW_MS) {
        // Within 30 days - restore account
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        user.isDeleted = false;
        user = await userDao.restoreAccount(user, session);
      } else {
        // After 30 days - create new account
        const blockUser = new BlockedUser({ block: false });
        const blockUserDetails = await blockUser.save({ session });
        let basicInfo = new BasicInfo({});
        const basicInfoDetails = await basicInfo.save({ session });

        user = new User({
          phoneNo,
          otp,
          otpExpiry,
          block: blockUserDetails._id,
          basicInfo: basicInfoDetails._id,
        });
        user = await user.save({ session });
      }
    } else {
      // Existing active user - handle block status
      const blockUser = await BlockedUser.findOne({ _id: user.block });
      if (blockUser?.block) {
        if (blockUser.blockExpiry > Date.now()) {
          const remainingTime = Math.ceil((blockUser.blockExpiry - Date.now()) / 1000 / 60);
          await session.abortTransaction();
          return createResponse.error({
            errorCode: 429,
            errorMessage: `Account blocked for ${remainingTime} minutes`,
          });
        } else {
          blockUser.block = false;
          blockUser.blockExpiry = null;
          user.resendCount = 1;
          await blockUser.save({ session });
        }
      }

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user = await user.save({ session });
    }

    await session.commitTransaction();
    await this.sendOTP(phoneNo, otp);

    return createResponse.success({
      phoneNo: user.phoneNo,
      resendCount: user.resendCount,
      isVerified: user.isVerified,
      id: user.id,
      otp: user?.otp,
      roles: roleNames, // Include roles in the response
    });

  } catch (e) {
    await session.abortTransaction();
    console.log("error", e);
    if (e instanceof AuthenticationError) {
      throw e;
    } else {
      throw new Error(e.message);
    }
  } finally {
    session.endSession();
  }
};

module.exports.sendOTP = async function sendOTP(phone, otp) {
  try {
    await client.messages.create({
      body: `Your OTP is ${otp}. Please enter this code to verify your identity. This code is valid for 5 minutes. Do not share it with anyone.\n\nThank you,\nYour Cyberpoint`,
      from: config.twilio.twilioPhoneNumber,
      to: `+91${phone}`,
    });
  } catch (err) {
    console.error(err);
    throw new Error("Failed to send OTP");
  }
};

module.exports.resendOtp = async function (phoneNo) {
  try {
    let user;
    user = await User.findOne({ phoneNo, isDeleted: false });
    if (!user) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "Invalid phone number."
      );
    }
    const blockUser = await BlockedUser.findOne({ _id: user.block });
    if (blockUser && blockUser.block) {
      if (blockUser.blockExpiry > Date.now()) {
        const remainingTime = Math.ceil(
          (blockUser.blockExpiry - Date.now()) / 1000 / 60
        );
        return createResponse.error({
          errorCode: 429,
          errorMessage: `Account blocked for ${remainingTime} minutes`,
        });
      } else {
        // Unblock the user after block expiry
        blockUser.block = false;
        blockUser.blockExpiry = null;
        await blockUser.save();
      }
    }
    const resendCount = user.resendCount + 1;
    user.resendCount = resendCount;
    if (resendCount >= 6) {
      blockUser.block = true;
      blockUser.blockExpiry = new Date(Date.now() + 15 * 60 * 1000); // Block for 15 minutes
      await blockUser.save();
      const response = {
        errorCode: 429,
        errorMessage: `Account blocked for 15 minutes`,
      };
      return createResponse.error(response);
    }
    const otp = authUtil.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user = await user.save();
    await this.sendOTP(user?.phoneNo, otp);
    return createResponse.success(user);
  } catch (e) {
    if (e instanceof AuthenticationError) {
      throw e;
    } else {
      throw new Error(e.message);
    }
  }
};

module.exports.initiateEmailChange = async function (userId, newEmail) {
  try {
    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "User not found."
      );
    }

    if (user.email === newEmail) {
      throw new customError.ValidationError(
        globalConstants.INVALID_INPUT_CODE,
        "New email is the same as the current email."
      );
    }

    // Check if the new email is already in use
    const existingUser = await User.findOne({ email: newEmail, isDeleted: false });
    if (existingUser) {
      throw new customError.ValidationError(
        globalConstants.INVALID_INPUT_CODE,
        "Email already in use."
      );
    }

    const otp = authUtil.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.emailChangeOTP = otp;
    user.emailChangeOTPExpiry = otpExpiry;
    user.newEmailRequest = newEmail;
    await user.save();

    // TODO: Send OTP to user's phone number
    await this.sendOTP(user?.phoneNo, otp);

    return createResponse.success(user);
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

module.exports.verifyOtpAndChangeEmail = async function (
  userId,
  otp,
  newEmail
) {
  try {
    const user = await User.findOne({
      _id: userId,
      isDeleted: false
    });
    if (!user) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "User not found."
      );
    }

    const now = Date.now();

    if (
      !user.emailChangeOTP ||
      !user.emailChangeOTPExpiry ||
      !user.newEmailRequest
    ) {
      throw new customError.ValidationError(
        globalConstants.INVALID_INPUT_CODE,
        "No email change request found."
      );
    }

    if (user.newEmailRequest !== newEmail) {
      throw new customError.ValidationError(
        globalConstants.INVALID_INPUT_CODE,
        "New email does not match the requested email change."
      );
    }

    if (
      user.emailChangeOTP !== otp ||
      now > user.emailChangeOTPExpiry.getTime()
    ) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "Invalid OTP or expired."
      );
    }

    // Check again if the new email is still available
    const existingUser = await User.findOne({ email: newEmail, isDeleted: false });
    if (existingUser) {
      throw new customError.ValidationError(
        globalConstants.INVALID_INPUT_CODE,
        "Email is no longer available."
      );
    }

    user.email = newEmail;
    user.emailChangeOTP = undefined;
    user.emailChangeOTPExpiry = undefined;
    user.newEmailRequest = undefined;

    await user.save();

    return createResponse.success(user);
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};



exports.socialLogin = async (provider, token, userData) => {
  try {
    let socialData;

    switch (provider) {
      case 'google':
        socialData = await verifyGoogleToken(token);
        break;
      case 'facebook':
        socialData = await verifyFacebookToken(token);
        break;
      case 'apple':
        socialData = await verifyAppleToken(token);
        break;
      default:
        throw new Error('Invalid provider');
    }

    let user = await User.findOne({
      email: socialData.email,
      isDeleted: false
    });

    if (!user) {
      const basicInfo = new BasicInfo({
        firstName: socialData.firstName || userData?.firstName,
        lastName: socialData.lastName || userData?.lastName,
        displayName: socialData.name || `${socialData.firstName} ${socialData.lastName}`,
        profilePic: socialData.picture
      });
      const savedBasicInfo = await basicInfo.save();

      user = new User({
        email: socialData.email,
        phoneNo: userData?.phoneNo,
        basicInfo: savedBasicInfo._id,
        isVerified: true,
        authProvider: provider
      });
      await user.save();
    }

    const token = await jwtUtil.generateToken({
      _id: user._id,
      email: user.email,
      phoneNo: user.phoneNo
    });

    return createResponse.success(user, token);
  } catch (error) {
    console.error("Social login error:", error);
    throw error;
  }
};

async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    return {
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      name: payload.name
    };
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}

async function verifyFacebookToken(token) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${token}`
    );
    const data = response.data;

    return {
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      picture: data.picture?.data?.url,
      name: `${data.first_name} ${data.last_name}`
    };
  } catch (error) {
    throw new Error('Invalid Facebook token');
  }
}

async function verifyAppleToken(token) {
  try {
    const appleData = await appleSignin.verifyIdToken(token, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: true,
    });

    return {
      email: appleData.email,
      firstName: '',
      lastName: '',
      name: '',
      sub: appleData.sub
    };
  } catch (error) {
    throw new Error('Invalid Apple token');
  }
}