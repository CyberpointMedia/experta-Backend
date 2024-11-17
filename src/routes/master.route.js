const routes = require("../constants/route.url");
const { authMiddleware } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const uploadMiddleWare = require("../middlewares/file.middleware");
const {hasRole}=require("../middlewares/role.middleware");
module.exports = (app) => {
  var router = require("express").Router();
  router.get("/industry", userController.getIndustry);
  router.get("/occupation/:industryId", userController.getOccupation);
  router.get("/user/by-industry/:industryId", userController.getUserByIndustry);
  router.post(
    "/industry",
    uploadMiddleWare.single("file"),
    [authMiddleware, hasRole('expert')],
    //    authMiddleware,
    userController.createOrUpdateIndustryOccupationMaster
  );
  router.post("/occupation", userController.createOrUpdateOccupation);
  app.use(routes.API, router);
};
