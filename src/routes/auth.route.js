const authController = require("../controllers/auth.controller");
const routes = require("../constants/route.url");

module.exports = (app) => {
  var router = require("express").Router();
  router.post("/register",authController.register);
  router.post("/verify-otp", authController.verifyOtp);
  router.post("/login", authController.handleLogin);
  router.post("/resend-otp", authController.resendOtp);
 app.use(routes.API, router);
};
