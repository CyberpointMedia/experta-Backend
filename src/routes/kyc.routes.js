const kycController = require("../controllers/kyc.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const uploadMiddleWare = require("../middlewares/file.middleware");

module.exports = (app) => {
  var router = require("express").Router();
  router.post("/verify-bank", authMiddleware, kycController.verifyBankAccount);
  router.post(
    "/face-liveness",
    authMiddleware,
    uploadMiddleWare.single("file"),
    kycController.checkFaceLiveness
  );
  router.post(
    "/face-match",
    authMiddleware,
    kycController.verifyFaceMatch
  );
  router.get("/status", authMiddleware, kycController.getKycStatus);
  router.get("/document-verified", authMiddleware, kycController.getDocumentVerificationStatus);
  router.post("/document-verified", authMiddleware, kycController.documentVerified);
  router.post("/verify-pan", authMiddleware, kycController.verifyPan);
  router.post("/face-liveness-client",authMiddleware,kycController.updateFaceLivenessClient);

  router.post("/save-upi", authMiddleware, kycController.saveUpiId);
  router.get("/banking-details", authMiddleware, kycController.getBankingDetails);
  router.get("/payment-methods-status", authMiddleware, kycController.checkPaymentMethodsStatus);
  router.post("/save-gst", authMiddleware, kycController.saveGstNumber);
  router.post("/");

  app.use("/api/kyc", router);
};
