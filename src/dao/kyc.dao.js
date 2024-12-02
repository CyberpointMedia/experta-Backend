const KYC = require("../models/kyc.model");
const User = require("../models/user.model");

module.exports.updateBankVerification = async function (userId, data) {
  try {
    const update = {
      userId,
      $set: {
        "bankVerification.accountNumber": data.accountNumber,
        "bankVerification.ifsc": data.ifsc,
        "bankVerification.verificationStatus": data.verificationStatus,
        "bankVerification.bankDetails": data.bankDetails,
        "bankVerification.updatedAt": data.updatedAt,
      },
    };

    return await KYC.findOneAndUpdate(
      { userId, isDeleted: false },
      update,
      { new: true, upsert: true }
    ).catch(error => {
      if (error.code === 11000) {
        const existingKYC = KYC.findOneAndUpdate(
          { userId, isDeleted: false },
          update.set,
          { new: true }
        );
        return existingKYC;
      }
      throw error;
    });
  } catch (error) {
    throw error;
  }
};

module.exports.updateFaceLiveness = async function (userId, data) {
  try {
    const update = {
      userId,
      $set: {
        "faceLiveness.status": data.livenessStatus,
        "faceLiveness.confidence": data.confidence,
        "faceLiveness.imageUrl": data.imageUrl,
        "faceLiveness.updatedAt": data.updatedAt,
      },
    };

    return await KYC.findOneAndUpdate(
      { userId, isDeleted: false },
      update,
      { new: true, upsert: true }
    ).catch(error => {
      if (error.code === 11000) {
        const existingKYC = KYC.findOneAndUpdate(
          { userId, isDeleted: false },
          update.set,
          { new: true }
        );
        return existingKYC;
      }
      throw error;
    });
  } catch (error) {
    throw error;
  }
};

module.exports.updateFaceMatch = async function (userId, data) {
  try {
    const update = {
      userId,
      $set: {
        "faceMatch.status": data.matchStatus,
        "faceMatch.confidence": data.confidence,
        "faceMatch.selfieUrl": data.selfieUrl,
        "faceMatch.idCardUrl": data.idCardUrl,
        "faceMatch.updatedAt": data.updatedAt,
      },
    };

    return await KYC.findOneAndUpdate(
      { userId, isDeleted: false },
      update,
      { new: true, upsert: true }
    ).catch(error => {
      if (error.code === 11000) {
        const existingKYC = KYC.findOneAndUpdate(
          { userId, isDeleted: false },
          update.set,
          { new: true }
        );
        return existingKYC;
      }
      throw error;
    });
  } catch (error) {
    throw error;
  }
};

module.exports.updatePanVerification = async function (userId, data) {
  try {
    const update = {
      userId,
      $set: {
        "panVerification.panNumber": data.panNumber,
        "panVerification.verificationStatus": data.verificationStatus,
        "panVerification.panDetails": data.panDetails,
        "panVerification.updatedAt": data.updatedAt,
      },
    };

    return await KYC.findOneAndUpdate(
      { userId, isDeleted: false },
      update,
      { new: true, upsert: true }
    ).catch(error => {
      if (error.code === 11000) {
        const existingKYC = KYC.findOneAndUpdate(
          { userId, isDeleted: false },
          update.set,
          { new: true }
        );
        return existingKYC;
      }
      throw error;
    });
  } catch (error) {
    throw error;
  }
};

module.exports.updateUpiDetails = async function (userId, upiId) {
  try {
    const update = {
      userId,
      $set: {
        "upiDetails.upiId": upiId,
        "upiDetails.updatedAt": new Date(),
      },
    };

    return await KYC.findOneAndUpdate(
      { userId, isDeleted: false },
      update,
      { new: true, upsert: true }
    ).catch(error => {
      if (error.code === 11000) {
        const existingKYC = KYC.findOneAndUpdate(
          { userId, isDeleted: false },
          update.set,
          { new: true }
        );
        return existingKYC;
      }
      throw error;
    });
  } catch (error) {
    throw error;
  }
};

module.exports.updateGstDetails = async function (userId, gstNumber) {
  try {
    const update = {
      userId,
      $set: {
        "gstDetails.gstNumber": gstNumber,
        "gstDetails.updatedAt": new Date(),
      },
    };

    return await KYC.findOneAndUpdate(
      { userId, isDeleted: false },
      update,
      { new: true, upsert: true }
    ).catch(error => {
      if (error.code === 11000) {
        const existingKYC = KYC.findOneAndUpdate(
          { userId, isDeleted: false },
          update.set,
          { new: true }
        );
        return existingKYC;
      }
      throw error;
    });
  } catch (error) {
    throw error;
  }
};

module.exports.getBankingDetails = async function (userId) {
  try {
    const kyc = await KYC.findOne({ userId, isDeleted: false })
      .select('bankVerification upiDetails gstDetails');
    return {
      bankDetails: kyc?.bankVerification || null,
      upiDetails: kyc?.upiDetails || null,
      gstDetails: kyc?.gstDetails || null
    };
  } catch (error) {
    throw error;
  }
};

module.exports.checkPaymentMethodsStatus = async function (userId) {
  try {
    const kyc = await KYC.findOne({ userId, isDeleted: false })
      .select('bankVerification upiDetails gstDetails');
    
    return {
      bank: {
        isAdded: !!kyc?.bankVerification?.accountNumber,
        isVerified: !!kyc?.bankVerification?.verificationStatus,
        details: kyc?.bankVerification?.accountNumber ? {
          accountHolderName: kyc?.bankVerification?.bankDetails?.full_name,
          accountNumber: kyc.bankVerification.accountNumber,
          ifsc: kyc.bankVerification.ifsc
        } : null
      },
      upi: {
        isAdded: !!kyc?.upiDetails?.upiId,
        details: kyc?.upiDetails?.upiId || null
      },
      gst: {
        isAdded: !!kyc?.gstDetails?.gstNumber,
        details: kyc?.gstDetails?.gstNumber || null
      }
    };
  } catch (error) {
    throw error;
  }
};

module.exports.getKycStatus = async function (userId) {
  try {
    const userData = await User.findById(userId).select('email phoneNo').lean();
    if (!userData) {
      throw new Error("User not found");
    }

    const kycData = await KYC.findOne({ userId, isDeleted: false }).lean();
    if (!kycData) {
      return {
        userData,
        bankVerification: {
          accountNumber: "",
          ifsc: "",
          verificationStatus: false,
          bankDetails: {},
          updatedAt: ""
        },
        faceLiveness: {
          status: false,
          confidence: 0,
          imageUrl: "",
          updatedAt: ""
        },
        faceMatch: {
          status: false,
          confidence: 0,
          selfieUrl: "",
          idCardUrl: "",
          updatedAt: ""
        },
        panVerification: {
          panNumber: "",
          verificationStatus: false,
          panDetails: {},
          updatedAt: ""
        },
        upiDetails: {
          upiId: "",
          updatedAt: ""
        },
        gstDetails: {
          gstNumber: "",
          updatedAt: ""
        },
        kycStatus: {
          isComplete: false,
          steps: {
            bankVerification: false,
            faceLiveness: false,
            faceMatch: false,
            panVerification: false
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Transform null values to appropriate defaults
    const transformedKycData = {
      bankVerification: {
        accountNumber: kycData.bankVerification?.accountNumber || "",
        ifsc: kycData.bankVerification?.ifsc || "",
        verificationStatus: kycData.bankVerification?.verificationStatus || false,
        bankDetails: kycData.bankVerification?.bankDetails || {},
        updatedAt: kycData.bankVerification?.updatedAt || ""
      },
      faceLiveness: {
        status: kycData.faceLiveness?.status || false,
        confidence: kycData.faceLiveness?.confidence || 0,
        imageUrl: kycData.faceLiveness?.imageUrl || "",
        updatedAt: kycData.faceLiveness?.updatedAt || ""
      },
      faceMatch: {
        status: kycData.faceMatch?.status || false,
        confidence: kycData.faceMatch?.confidence || 0,
        selfieUrl: kycData.faceMatch?.selfieUrl || "",
        idCardUrl: kycData.faceMatch?.idCardUrl || "",
        updatedAt: kycData.faceMatch?.updatedAt || ""
      },
      panVerification: {
        panNumber: kycData.panVerification?.panNumber || "",
        verificationStatus: kycData.panVerification?.verificationStatus || false,
        panDetails: kycData.panVerification?.panDetails || {},
        updatedAt: kycData.panVerification?.updatedAt || ""
      },
      upiDetails: {
        upiId: kycData.upiDetails?.upiId || "",
        updatedAt: kycData.upiDetails?.updatedAt || ""
      },
      gstDetails: {
        gstNumber: kycData.gstDetails?.gstNumber || "",
        updatedAt: kycData.gstDetails?.updatedAt || ""
      }
    };

    const kycStatus = {
      isComplete: false,
      steps: {
        bankVerification: transformedKycData.bankVerification.verificationStatus,
        faceLiveness: transformedKycData.faceLiveness.status,
        faceMatch: transformedKycData.faceMatch.status,
        panVerification: transformedKycData.panVerification.verificationStatus
      }
    };

    kycStatus.isComplete = Object.values(kycStatus.steps).every(status => status === true);

    return {
      userData,
      ...transformedKycData,
      kycStatus,
      createdAt: kycData.createdAt,
      updatedAt: kycData.updatedAt
    };
  } catch (error) {
    throw error;
  }
};