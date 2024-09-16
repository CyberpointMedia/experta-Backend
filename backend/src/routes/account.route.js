const routes = require("../constants/route.url");
const { authMiddleware } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

module.exports = (app) => {
    var router = require("express").Router();
    router.post("/account-setting",authMiddleware, userController.accountSetting);
    router.get("/account-setting", authMiddleware,userController.getAccountSetting);
    //  router.post(
    //    "/policy",
    //    authMiddleware,
    //    userController.createPolicy
    //  );
    //  router.get("/policy", authMiddleware, userController.getPolicy);
     
    app.use(routes.API, router);
};
