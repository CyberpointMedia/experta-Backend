
const fileUploadController = require("../controllers/file.controller");
const routes = require("../constants/route.url");

module.exports = (app) => {
  var router = require("express").Router();
  router.post("/upload", fileUploadController.uploadFile);
  router.delete("/delete-file", fileUploadController.deleteFile);
  app.use(routes.API, router);
};
