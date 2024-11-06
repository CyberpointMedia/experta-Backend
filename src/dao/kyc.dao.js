const KYC = require("../models/kyc.model");
const User=require("../models/user.model");

module.exports.updateBankVerification = async function (userId, data) {
  try {
    return await KYC.findOneAndUpdate(
      { userId },
      {
        $set: {
          "bankVerification.accountNumber": data.accountNumber,
          "bankVerification.ifsc": data.ifsc,
          "bankVerification.verificationStatus": data.verificationStatus,
          "bankVerification.bankDetails": data.bankDetails,
          "bankVerification.updatedAt": data.updatedAt,
        },
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw error;
  }
};

module.exports.updateFaceLiveness = async function (userId, data) {
  try {
    return await KYC.findOneAndUpdate(
      { userId },
      {
        $set: {
          "faceLiveness.status": data.livenessStatus,
          "faceLiveness.confidence": data.confidence,
          "faceLiveness.imageUrl": data.imageUrl,
          "faceLiveness.updatedAt": data.updatedAt,
        },
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw error;
  }
};

module.exports.updateFaceMatch = async function (userId, data) {
  try {
    return await KYC.findOneAndUpdate(
      { userId },
      {
        $set: {
          "faceMatch.status": data.matchStatus,
          "faceMatch.confidence": data.confidence,
          "faceMatch.selfieUrl": data.selfieUrl,
          "faceMatch.idCardUrl": data.idCardUrl,
          "faceMatch.updatedAt": data.updatedAt,
        },
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw error;
  }
};

module.exports.updatePanVerification = async function (userId, data) {
  try {
    return await KYC.findOneAndUpdate(
      { userId },
      {
        $set: {
          "panVerification.panNumber": data.panNumber,
          "panVerification.verificationStatus": data.verificationStatus,
          "panVerification.panDetails": data.panDetails,
          "panVerification.updatedAt": data.updatedAt,
        },
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw error;
  }
};

module.exports.getKycStatus = async function (userId) {
  try {
    const data= await KYC.findOne({ userId }).lean();
    const userData = await User.findById(userId).select('email phoneNo').lean();
    console.log("data--> ",data);
    return {userData,...data}
  
  } catch (error) {
    throw error;
  }
};
