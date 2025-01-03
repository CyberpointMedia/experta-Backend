const errorMessageConstants = require("../constants/error.messages");
const createResponse = require("../utils/response");
const kycService = require("../services/kyc.service");

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
    const kycStatus = await kycService.getKycStatus(userId);
    res.json(createResponse.success(kycStatus));
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