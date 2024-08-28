const chatController = require("../controllers/chat.controller");
const routes = require("../constants/route.url");
const { authMiddleware } = require("../middlewares/auth.middleware");

module.exports = (app) => {
  var router = require("express").Router();
  router
    .route("/chat")
    .post(authMiddleware, chatController.createOrRetrieveChat)
    .get(authMiddleware, chatController.fetchChats);
  app.use(routes.API, router);
};
