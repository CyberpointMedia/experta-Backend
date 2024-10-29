const KYC = require("../models/kyc.model");

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

module.exports.getKycStatus = async function (userId) {
  try {
    return await KYC.findOne({ userId }).lean();
  } catch (error) {
    throw error;
  }
};
