const errorMessageConstants = require("../constants/error.messages");
const createResponse = require("../utils/response");
const kycService = require("../services/kyc.service");
const User = require("../models/user.model"); 

exports.documentVerified = async (req, res) => {
  const userId = req.body.user._id;
  const { documentType, verified, reason } = req.body;
  console.log("documentType", documentType, userId, verified, reason);

  if (!userId || !documentType || typeof verified !== "boolean") {
    res.send(createResponse.invalid("Required fields missing"));
    return;
  }

  try {
    const kycRecord = await kycService.getKycByUserId(userId);
    console.log("kycRecord", kycRecord);

    const documentIndex = kycRecord.documents.findIndex(
      (doc) => doc.documentType === documentType
    );

    if (documentIndex === -1) {
      kycRecord.documents.push({ documentType, verified, reason });
    } else {
      kycRecord.documents[documentIndex].verified = verified;
      kycRecord.documents[documentIndex].reason = reason;
    }
    await kycRecord.save();

    res.json(
      createResponse.success({
        message: "Document verification status updated successfully",
        document: kycRecord.documents.find(
          (doc) => doc.documentType === documentType
        ),
      })
    );
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.getDocumentVerificationStatus = async (req, res) => {
  const userId = req.body.user._id;
  const { documentType } = req.query; // Optional: To check a specific document type

  if (!userId) {
    res.send(createResponse.invalid("User ID is required"));
    return;
  }

  try {
    const kycRecord = await kycService.getKycByUserId(userId);

    if (!kycRecord) {
      res.send(createResponse.error({
        errorCode: errorMessageConstants.KYC_RECORD_NOT_FOUND_CODE,
        errorMessage: "KYC record not found",
      }));
      return;
    }

    if (documentType) {
      // Check the verification status of a specific document type
      const document = kycRecord.documents.find(doc => doc.documentType === documentType);

      if (!document) {
        res.send(createResponse.error({
          errorCode: errorMessageConstants.DOCUMENT_NOT_FOUND_CODE,
          errorMessage: "Document type not found",
        }));
        return;
      }

      res.json(createResponse.success({
        message: "Document verification status retrieved successfully",
        document,
      }));
    } else {
      // Return the verification status of all documents
      res.json(createResponse.success({
        message: "All document verification statuses retrieved successfully",
        documents: kycRecord.documents,
      }));
    }
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.verifyBankAccount = async (req, res) => {
  const userId = req.body.user._id;
  const { accountNumber, ifsc } = req.body;
   
  if (!userId || !accountNumber || !ifsc) {
    res.send(createResponse.invalid("Required fields missing"));
    return;
  }

  try {
    const verificationResult = await kycService.verifyBankAccount(
      userId,
      accountNumber,
      ifsc
    );
    res.json(verificationResult);
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.checkFaceLiveness = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId || !req.file) {
    res.send(createResponse.invalid("User ID and face image required"));
    return;
  }

  try {
    const livenessResult = await kycService.checkFaceLiveness(userId, req.file);
    res.json(livenessResult);
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.verifyFaceMatch = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId || !req.files.selfie || !req.files.id_card) {
    res.send(createResponse.invalid("Selfie and ID card images required"));
    return;
  }

  try {
    const matchResult = await kycService.verifyFaceMatch(
      userId,
      req.files.selfie[0],
      req.files.id_card[0]
    );
    res.json(matchResult);
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.getKycStatus = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }

  try {
    const kycStatusResponse = await kycService.getKycStatus(userId);
    const { userData, kycStatus } = kycStatusResponse;

    // Update the user's KYC status in the user model
    await User.findByIdAndUpdate(userId, { kycStatus: kycStatus.isComplete });

    res.json(createResponse.success({ userData, kycStatus }));
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.verifyPan = async (req, res) => {
  const userId = req.body.user._id;
  const { panNumber } = req.body;

  if (!userId || !panNumber) {
    res.send(createResponse.invalid("User ID and PAN number required"));
    return;
  }

  try {
    const verificationResult = await kycService.verifyPan(userId, panNumber);
    res.json(verificationResult);
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.updateFaceLivenessClient = async (req, res) => {
  const userId = req.body.user._id;
  const { livenessStatus } = req.body;
   
  if (!userId || livenessStatus === undefined) {
    res.send(createResponse.invalid("User ID and liveness status required"));
    return;
  }

  try {
    const data = {
      livenessStatus,
      confidence: 100, 
      imageUrl: null, 
      updatedAt: new Date()
    };

    const result = await kycService.updateFaceLivenessClient(userId, data);
    res.json(createResponse.success(result));
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.saveUpiId = async (req, res) => {
  const userId = req.body.user._id;
  const { upiId } = req.body;

  if (!userId || !upiId) {
    res.json(createResponse.invalid("User ID and UPI ID are required"));
    return;
  }

  try {
    const result = await kycService.saveUpiId(userId, upiId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.getBankingDetails = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.json(createResponse.invalid("User ID is required"));
    return;
  }

  try {
    const result = await kycService.getBankingDetails(userId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};


exports.checkPaymentMethodsStatus = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.json(createResponse.invalid("User ID is required"));
    return;
  }
  try {
    const result = await kycService.checkPaymentMethodsStatus(userId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.saveGstNumber = async (req, res) => {
  const userId = req.body.user._id;
  const { gstNumber } = req.body;

  if (!userId || !gstNumber) {
    res.json(createResponse.invalid("User ID and GST number are required"));
    return;
  }

  try {
    const result = await kycService.saveGstNumber(userId, gstNumber);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};