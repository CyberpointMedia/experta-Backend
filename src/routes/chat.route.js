// routes/chat.route.js
const express = require("express");
const chatController = require("../controllers/chat.controller");
const {authMiddleware} = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/file.middleware");
const routes = require("../constants/route.url");

module.exports = (app) => {
    var router = require("express").Router();
    router.post("/send", uploadMiddleware.single("file"), authMiddleware, chatController.sendMessage);
    router.get("/messages/:userId", authMiddleware, chatController.getMessages);
    router.get("/conversations", authMiddleware, chatController.getConversations); // New route
    app.use(routes.API, router);
};
