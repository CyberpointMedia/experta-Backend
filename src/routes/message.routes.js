const { Router } = require("express");
const {
  fetchMessages,
  deleteMessages,
  updateMessage,
  sendMessage,
  accessAttachment,
} = require("../controllers/chat.controller.js");
const uploadMiddleWare = require("../middlewares/file.middleware.js");
const routes = require("../constants/route.url");
const { authMiddleware } = require("../middlewares/auth.middleware.js");
const chatController = require("../controllers/chat.controller");
const router = Router();

/*   Base route: /api/message   */
module.exports = (app) => {
  var router = require("express").Router();
  router
    .route("/")
    .post(
      uploadMiddleWare.single("file"),
      authMiddleware,
      chatController.sendMessage
    );
  router.get("/:chatId", authMiddleware, chatController.fetchMessages);
  router.post("/read/:chatId", authMiddleware, chatController.markMessagesAsRead);
  app.use(routes.MESSAGE_API, router);
};
