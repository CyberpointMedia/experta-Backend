const KYC = require("../models/kyc.model");
const User=require("../models/user.model");

module.exports.updateBankVerification = async function (userId, data) {
  try {
    return await KYC.findOneAndUpdate(
      { _id:userId ,isDeleted:false },
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
      {_id:userId,isDeleted:false},
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
      { _id:userId,isDeleted:false },
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
      { _id:userId,isDeleted:false },
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
    // Create default KYC structure
    const defaultKyc = {
      bankVerification: {
        accountNumber: "",
        ifsc: "",
        verificationStatus: false,
        bankDetails: {},
        updatedAt: null
      },
      faceLiveness: {
        status: false,
        confidence: 0,
        imageUrl: "",
        updatedAt: null
      },
      faceMatch: {
        status: false,
        confidence: 0,
        selfieUrl: "",
        idCardUrl: "",
        updatedAt: null
      },
      panVerification: {
        panNumber: "",
        verificationStatus: false,
        panDetails: {},
        updatedAt: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Get user data
    const userData = await User.findById(userId).select('email phoneNo').lean();
    if (!userData) {
      throw new Error("User not found");
    }

    // Get KYC data
    const kycData = await KYC.findOne({ userId }).lean();

    // If KYC exists, merge it with defaults to ensure all fields exist
    const mergedKyc = kycData ? mergeWithDefaults(kycData, defaultKyc) : defaultKyc;

    // Calculate KYC status
    const kycStatus = {
      isComplete: false,
      steps: {
        bankVerification: mergedKyc.bankVerification.verificationStatus || false,
        faceLiveness: mergedKyc.faceLiveness.status || false,
        faceMatch: mergedKyc.faceMatch.status || false,
        panVerification: mergedKyc.panVerification.verificationStatus || false
      }
    };

    kycStatus.isComplete = Object.values(kycStatus.steps).every(status => status === true);

    return {
      userData,
      bankVerification: mergedKyc.bankVerification,
      faceLiveness: mergedKyc.faceLiveness,
      faceMatch: mergedKyc.faceMatch,
      panVerification: mergedKyc.panVerification,
      kycStatus,
      createdAt: mergedKyc.createdAt,
      updatedAt: mergedKyc.updatedAt
    };

  } catch (error) {
    throw error;
  }
};

function mergeWithDefaults(kycData, defaultKyc) {
  const merged = { ...defaultKyc };

  const mergeNestedObject = (source, target, key) => {
    if (source[key]) {
      Object.keys(target[key]).forEach(subKey => {
        if (source[key][subKey] === null || source[key][subKey] === undefined) {
          if (typeof target[key][subKey] === 'string') {
            source[key][subKey] = "";
          } else if (typeof target[key][subKey] === 'number') {
            source[key][subKey] = 0;
          } else if (typeof target[key][subKey] === 'boolean') {
            source[key][subKey] = false;
          } else if (typeof target[key][subKey] === 'object' && !Array.isArray(target[key][subKey])) {
            source[key][subKey] = {};
          }
        }
      });
      merged[key] = source[key];
    }
  };

  mergeNestedObject(kycData, defaultKyc, 'bankVerification');
  mergeNestedObject(kycData, defaultKyc, 'faceLiveness');
  mergeNestedObject(kycData, defaultKyc, 'faceMatch');
  mergeNestedObject(kycData, defaultKyc, 'panVerification');

  return merged;
}



module.exports.updateUpiDetails = async function (userId, upiId) {
  try {
    return await KYC.findOneAndUpdate(
      { _id:userId,isDeleted:false },
      {
        $set: {
          "upiDetails.upiId": upiId,
          "upiDetails.updatedAt": new Date(),
        },
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw error;
  }
};

module.exports.getBankingDetails = async function (userId) {
  try {
    const kyc = await KYC.findOne({ _id:userId , isDeleted:false }).select('bankVerification upiDetails');
    return {
      bankDetails: kyc?.bankVerification || null,
      upiDetails: kyc?.upiDetails || null
    };
  } catch (error) {
    throw error;
  }
};

module.exports.checkPaymentMethodsStatus = async function (userId) {
  try {
    const kyc = await KYC.findOne({ _id:userId, isDeleted:false }).select('bankVerification upiDetails');
    console.log("kyc--> ",kyc?.bankVerification);
    return {
      bank: {
        isAdded: !!kyc?.bankVerification?.accountNumber,
        isVerified: !!kyc?.bankVerification?.verificationStatus,
        details: kyc?.bankVerification?.accountNumber 
          ? {
              accountHolderName:kyc?.bankVerification?.bankDetails?.full_name,
              accountNumber: kyc.bankVerification.accountNumber,
              ifsc: kyc.bankVerification.ifsc
            } 
          : null
      },
      upi: {
        isAdded: !!kyc?.upiDetails?.upiId,
        details: kyc?.upiDetails?.upiId || null
      }
    };
  } catch (error) {
    throw error;
  }
};


exports.updateGstDetails = async function (userId, gstNumber) {
  try {
    return await KYC.findOneAndUpdate(
      {_id:userId,isDeleted:false },
      {
        $set: {
          "gstDetails.gstNumber": gstNumber,
          "gstDetails.updatedAt": new Date(),
        },
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw error;
  }
};

// Update the existing getBankingDetails to include GST
exports.getBankingDetails = async function (userId) {
  try {
    const kyc = await KYC.findOne({ _id:userId , isDeleted:false }).select('bankVerification upiDetails gstDetails');
    return {
      bankDetails: kyc?.bankVerification || null,
      upiDetails: kyc?.upiDetails || null,
      gstDetails: kyc?.gstDetails || null
    };
  } catch (error) {
    throw error;
  }
};

exports.checkPaymentMethodsStatus = async function (userId) {
  try {
    const kyc = await KYC.findOne({ _id:userId,isDeleted:false }).select('bankVerification upiDetails gstDetails');
    return {
      bank: {
        isAdded: !!kyc?.bankVerification?.accountNumber,
        isVerified: !!kyc?.bankVerification?.verificationStatus,
        details: kyc?.bankVerification?.accountNumber 
          ? {
              accountHolderName:kyc?.bankVerification?.bankDetails?.full_name,
              accountNumber: kyc.bankVerification.accountNumber,
              ifsc: kyc.bankVerification.ifsc
            } 
          : null
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
