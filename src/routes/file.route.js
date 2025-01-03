
const fileUploadController = require("../controllers/file.controller");
const routes = require("../constants/route.url");
const { authMiddleware } = require("../middlewares/auth.middleware");

module.exports = (app) => {
  var router = require("express").Router();
  router.post("/upload", fileUploadController.uploadFile);
  router.delete("/delete-file", fileUploadController.deleteFile);
  router.get("/videos",authMiddleware, fileUploadController.getVideoFiles);
  router.post("/uploadRecordingVideo",authMiddleware, fileUploadController.uploadRecordingVideo); 
  app.use(routes.API, router);
};