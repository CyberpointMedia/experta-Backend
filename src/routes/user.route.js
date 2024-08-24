const userController = require("../controllers/user.controller");
const routes = require("../constants/route.url");
const { authMiddleware } = require("../middlewares/auth.middleware");
const uploadMiddleWare = require("../middlewares/file.middleware");
const User=require("../models/user.model")

module.exports = (app) => {
  var router = require("express").Router();
  router.get("/basic-info", authMiddleware, userController.getBasicInfo);
  router.post(
    "/create-basic-info",
    uploadMiddleWare.single("file"),
    authMiddleware,
    userController.createBasicInfo
  );
  router.post(
    "/create-industry-info",
    uploadMiddleWare.single("file"),
    authMiddleware,
    userController.createOrUpdateIndustryOccupation
  );

  router.get(
    "/industry-info",
    authMiddleware,
    userController.getIndustryOccupation
  );

  router.post(
    "/create-expertise",
    authMiddleware,
    userController.createExpertise
  );

  router.get("/expertise", authMiddleware, userController.getExpertise);

  router.post(
    "/create-expertise-items",
    authMiddleware,
    userController.createExpertiseItem
  );

  router.get(
    "/expertise-items",
    authMiddleware,
    userController.getExpertiseItems
  );

  router.post(
    "/create-education",
    authMiddleware,
    userController.createOrUpdateEducation
  );

  router.get("/education", authMiddleware, userController.getEducation);
  router.get("/education/:id", authMiddleware, userController.getEducationById);
  router.delete(
    "/education/:id",
    authMiddleware,
    userController.deleteEducationById
  );
  router.post(
    "/create-work-experience",
    authMiddleware,
    userController.createOrUpdateWorkExperience
  );

  router.get(
    "/work-experience",
    authMiddleware,
    userController.getWorkExperience
  );

  router.delete(
    "/work-experience/:id",
    authMiddleware,
    userController.deleteWorkExperienceById
  );
  router.get(
    "/work-experience/:id",
    authMiddleware,
    userController.getWorkExperienceById
  );

  router.get("/user-about", authMiddleware, userController.getUserAbout);

  router.post(
    "/create-user-about",
    authMiddleware,
    userController.createOrUpdateUserAbout
  );

  // interest
  router.get("/interest", authMiddleware, userController.getUserInterest);
  router.get(
    "/interest-items",
    authMiddleware,
    userController.getUserInterestItems
  );

  router.post(
    "/create-user-interest",
    authMiddleware,
    userController.createUserInterest
  );

  router.post(
    "/create-interest-items",
    authMiddleware,
    userController.createInterestItem
  );

  // language

  router.get("/language", authMiddleware, userController.getUserLanguages);
  router.get("/all-languages-list", userController.getAllLanguages);
  router.post("/create-languages-list", userController.createLanguagesList);

  router.post(
    "/create-user-language",
    authMiddleware,
    userController.createUserLanguage
  );

  // set availability and pricing

  router.post(
    "/create-user-pricing",
    authMiddleware,
    userController.createOrUpdateUserPricing
  );

  router.post(
    "/create-user-availability",
    authMiddleware,
    userController.createOrUpdateAvailability
  );

  router.get("/user-pricing", authMiddleware, userController.getUserPricing);
  router.get(
    "/user-availability",
    authMiddleware,
    userController.getUserAvailability
  );

  router.get(
    "/availability/:id",
    authMiddleware,
    userController.getAvailabilityById
  );
  router.delete(
    "/availability/:id",
    authMiddleware,
    userController.deleteAvailabilityById
  );

  router.post("/getUserData", userController.getUserData);

  router.get("/getUserBySearch/:search", userController.getUserBySearch);
  /// follwing and follwers
  router.post(
    "/profile/follow",
    authMiddleware,
    userController.addFollowerOrFollowing
  );

  router.get(
    "/profile/:userId/followersandfollowing",
    userController.getfollowersandfollowing
  );

  router.post(
    "/removeConnection",
    authMiddleware,
    userController.removeConnection
  );

  // block
  router.get(
    "/getAllBlockedUsers",
    authMiddleware,
    userController.getAllBlockedUsers
  );

  router.post("/blockUser", authMiddleware, userController.blockUser);

  router.post("/unblockUser", authMiddleware, userController.unblockUser);

  router.get("/categories", userController.getCategories);
  router.get("/trending", userController.getTrending);
  router.get(
    "/profile-completion/:userId",
    userController.getProfileCompletion
  );
  app.use(routes.API, router);
};
