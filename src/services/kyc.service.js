const axios = require("axios");
const FormData = require("form-data");
const kycDao = require("../dao/kyc.dao");
const config = require("../config/config");
const createResponse = require("../utils/response");

const SUREPASS_API_URL = config.surepass.surepassUrl;
const SUREPASS_TOKEN = config.surepass.surepassToken;

module.exports.verifyBankAccount = async function (
  userId,
  accountNumber,
  ifsc
) {
  try {
    const response = await axios.post(
      `${SUREPASS_API_URL}/bank-verification/`,
      {
        id_number: accountNumber,
        ifsc: ifsc,
        ifsc_details: true,
      },
      {
        headers: {
          Authorization: `Bearer ${SUREPASS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      await kycDao.updateBankVerification(userId, {
        accountNumber,
        ifsc,
        verificationStatus: true,
        bankDetails: response.data.data,
        updatedAt: new Date(),
      });
    }

    return createResponse.success(response.data);
  } catch (error) {
    console.error("Bank verification error:", error);
    throw error;
  }
};

module.exports.checkFaceLiveness = async function (userId, file) {
  try {
    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await axios.post(
      `${SUREPASS_API_URL}/face/face-liveness`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${SUREPASS_TOKEN}`,
          ...formData.getHeaders(),
        },
      }
    );

    if (response.data.success) {
      await kycDao.updateFaceLiveness(userId, {
        livenessStatus: response.data.data.live,
        confidence: response.data.data.confidence,
        imageUrl: file.location,
        updatedAt: new Date(),
      });
    }

    return createResponse.success(response.data);
  } catch (error) {
    console.error("Face liveness check error:", error);
    throw error;
  }
};

module.exports.verifyFaceMatch = async function (userId, selfie, idCard) {
  try {
    const formData = new FormData();
    formData.append("selfie", selfie.buffer, {
      filename: selfie.originalname,
      contentType: selfie.mimetype,
    });
    formData.append("id_card", idCard.buffer, {
      filename: idCard.originalname,
      contentType: idCard.mimetype,
    });

    const response = await axios.post(
      `${SUREPASS_API_URL}/face/face-match`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${SUREPASS_TOKEN}`,
          ...formData.getHeaders(),
        },
      }
    );

    if (response.data.success) {
      await kycDao.updateFaceMatch(userId, {
        matchStatus: response.data.data.match_status,
        confidence: response.data.data.confidence,
        selfieUrl: selfie.location,
        idCardUrl: idCard.location,
        updatedAt: new Date(),
      });
    }

    return createResponse.success(response.data);
  } catch (error) {
    console.error("Face match verification error:", error);
    throw error;
  }
};

exports.verifyPan = async function (userId, panNumber) {
  try {
    const response = await axios.post(
      `${SUREPASS_API_URL}/pan/pan`,
      {
        id_number: panNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${SUREPASS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      await kycDao.updatePanVerification(userId, {
        panNumber,
        verificationStatus: true,
        panDetails: response.data.data,
        updatedAt: new Date(),
      });
    }

    return createResponse.success(response.data);
  } catch (error) {
    console.error("PAN verification error:", error);
    throw error;
  }
};

module.exports.getKycStatus = async function (userId) {
  try {
    const kycStatus = await kycDao.getKycStatus(userId);
    return kycStatus;
  } catch (error) {
    console.error("Get KYC status error:", error);
    throw error;
  }
};

module.exports.updateFaceLivenessClient = async function (userId, data) {
  try {
    const result = await kycDao.updateFaceLiveness(userId, data);
    return createResponse.success(result);
  } catch (error) {
    console.error("Face liveness client update error:", error);
    throw error;
  }
};


exports.saveUpiId = async function (userId, upiId) {
  try {
    await kycDao.updateUpiDetails(userId, upiId);
    return createResponse.success({
      message: "UPI ID saved successfully",
      upiId
    });
  } catch (error) {
    console.error("Error saving UPI ID:", error);
    throw error;
  }
};

exports.getBankingDetails = async function (userId) {
  try {
    const details = await kycDao.getBankingDetails(userId);
    return createResponse.success(details);
  } catch (error) {
    console.error("Error fetching banking details:", error);
    throw error;
  }
};

exports.checkPaymentMethodsStatus = async function (userId) {
  try {
    const status = await kycDao.checkPaymentMethodsStatus(userId);
    return createResponse.success(status);
  } catch (error) {
    console.error("Error checking payment methods status:", error);
    throw error;
  }
};



