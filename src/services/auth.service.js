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
const {
  AuthenticationError,
  ValidationError,
} = require("../errors/custom.error");
const BasicInfo = require("../models/basicInfo.model");
const twilio = require("twilio");

const client = twilio(config.twilio.accountSid, config.twilio.twilioAuthToken);
module.exports.validateUser = async function (userData) {
  try {
    const { firstName, lastName, email, phoneNo } = userData;
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNo }] });
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
    let user = new User({
      email,
      phoneNo,
      otp,
      otpExpiry,
      basicInfo: basicInfoDetails._id,
    });
    user = await user.save();
    await this.sendOTP(user.phoneNo, otp);
    const userResponse = {
      lastName,
      firstName,
      email: user.email,
      phoneNo: user.phoneNo,
      resendCount: user.resendCount,
      otp: user.otp,
      otpExpiry: user.otpExpiry,
      block: user.block,
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
    const user = await User.findOne({ phoneNo });
    if (!user) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "Invalid phone number."
      );
    }

    if (user.block) {
      if (user.blockExpiry > Date.now()) {
        const remainingTime = Math.ceil((user.blockExpiry - Date.now()) / 1000 / 60);
        return createResponse.error({
          errorCode: 429,
          errorMessage: `Account blocked for ${remainingTime} minutes`,
        });
      } else {
        user.block = false;
        user.blockExpiry = null;
        user.resendCount = 0;
        await user.save();
      }
    }

    const now = Date.now();
    if (user.otp !== otp || (user.otpExpiry && now > user.otpExpiry.getTime())) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "Invalid OTP or expired."
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
  try {
    // First check if user exists
    let user = await User.findOne({ phoneNo });
    const otp = authUtil.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (!user) {
      // If user doesn't exist, create new user with minimal info
      let basicInfo = new BasicInfo({});
      const basicInfoDetails = await basicInfo.save();
      
      user = new User({
        phoneNo,
        otp,
        otpExpiry,
        basicInfo: basicInfoDetails._id,
      });
      user = await user.save();
    } else {
      // Existing user - handle block status
      if (user.block) {
        if (user.blockExpiry > Date.now()) {
          const remainingTime = Math.ceil((user.blockExpiry - Date.now()) / 1000 / 60);
          return createResponse.error({
            errorCode: 429,
            errorMessage: `Account blocked for ${remainingTime} minutes`,
          });
        } else {
          user.block = false;
          user.blockExpiry = null;
          user.resendCount = 1;
          await user.save();
        }
      }

      // Update OTP for existing user
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user = await user.save();
    }

    // Send OTP
    await this.sendOTP(phoneNo, otp);

    // Return user info without sensitive data
    const userResponse = {
      phoneNo: user.phoneNo,
      resendCount: user.resendCount,
      isVerified: user.isVerified,
      id: user.id,
      otp:user.otp
    };

    return createResponse.success(userResponse);

  } catch (e) {
    console.log("error", e);
    if (e instanceof AuthenticationError) {
      throw e;
    } else {
      throw new Error(e.message);
    }
  }
};
module.exports.sendOTP = async function sendOTP(phone, otp) {
  try {
    // Replace with your SMS provider integration code
    await client.messages.create({
      body: `Your OTP is ${otp}. Please enter this code to verify your identity. This code is valid for 5 minutes. Do not share it with anyone.\n\nThank you,\nYour Cyberpoint`,
      from: "+13344313201",
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
    user = await User.findOne({ phoneNo });
    if (!user) {
      throw new customError.AuthenticationError(
        globalConstants.INVALID_USER_CODE,
        "Invalid phone number."
      );
    }
    if (user.block) {
      if (user.blockExpiry > Date.now()) {
        const remainingTime = Math.ceil(
          (user.blockExpiry - Date.now()) / 1000 / 60
        );
        const response = {
          errorCode: 429,
          errorMessage: `Account blocked for ${remainingTime} minutes`,
        };
        return createResponse.error(response);
      } else {
        user.block = false; // Unblock after expiry
        user.blockExpiry = null;
        user.resendCount = 1;
        await user.save();
      }
    }
    const resendCount = user.resendCount + 1;
    user.resendCount = resendCount;
    if (resendCount >= 6) {
      user.block = true;
      user.blockExpiry = new Date(Date.now() + 15 * 60 * 1000); // Block for 15 minutes
      await user.save();
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
    const user = await User.findById(userId);
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
    const existingUser = await User.findOne({ email: newEmail });
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
    const user = await User.findById(userId);
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
    const existingUser = await User.findOne({ email: newEmail });
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
