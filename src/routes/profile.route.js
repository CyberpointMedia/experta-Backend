const userController = require("../controllers/user.controller");
const routes = require("../constants/route.url");
const { authMiddleware } = require("../middlewares/auth.middleware");
const postController = require("../controllers/post.controllers");

module.exports = (app) => {
  var router = require("express").Router();
  router.get("/post/detail", postController.getPostDetails);
  router.post("/post/create", authMiddleware, postController.createPost);
  router.get(
    "/post/likeUnlike/:id",
    authMiddleware,
    postController.likeUnlikePost
  );
  app.use(routes.API, router);
};
