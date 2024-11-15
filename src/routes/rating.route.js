const ratingController = require("../controllers/rating.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");




module.exports = (app) => {
    const router = require("express").Router();
    router.post("/video-rating", authMiddleware, ratingController.submitRating);
    router.get("/expert-ratings/:expertId", ratingController.getExpertRatings);
    app.use("/api", router);
  };