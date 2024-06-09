const routes = require("../constants/route.url");
const { authMiddleware } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

module.exports = (app) => {
    var router = require("express").Router();
    router.get("/industry", userController.getIndustry);
    router.get("/occupation/:industryId",userController.getOccupation);
    router.get("/user/by-industry:industryId", userController.getUserByIndustry);
    //  router.post(
    //    "/policy",
    //    authMiddleware,
    //    userController.createPolicy
    //  );
    //  router.get("/policy", authMiddleware, userController.getPolicy);
     
    app.use(routes.API, router);
};
