const authController = require("../controllers/auth.controller");
const routes = require("../constants/route.url");
const { authMiddleware } = require("../middlewares/auth.middleware");

module.exports = (app) => {
  var router = require("express").Router();
  router.post("/register", authController.register);
  router.post("/verify-otp", authController.verifyOtp);
  router.post("/login", authController.handleLogin);
  router.post("/resend-otp", authController.resendOtp);
  router.post(
    "/initiate-email-change",
    authMiddleware,
    authController.initiateEmailChange
  );
  router.post(
    "/verify-otp-change-email",
    authMiddleware,
    authController.verifyOtpAndChangeEmail
  );
  router.get("/check-token", authController.checkTokenValidity);
  app.use(routes.API, router);
};
