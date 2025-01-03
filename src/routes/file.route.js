
const fileUploadController = require("../controllers/file.controller");
const routes = require("../constants/route.url");

module.exports = (app) => {
  var router = require("express").Router();
  router.post("/upload", fileUploadController.uploadFile);
  router.delete("/delete-file", fileUploadController.deleteFile);
  router.get("/videos", fileUploadController.getVideoFiles);
  router.post("/uploadRecordingVideo", fileUploadController.uploadRecordingVideo); 
  app.use(routes.API, router);
};