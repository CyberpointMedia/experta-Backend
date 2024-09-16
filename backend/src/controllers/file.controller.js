const fileUploadService = require("../services/fileUpload.service");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
const multer = require("multer");
const upload = multer().single("file");

exports.uploadFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const s3Url = await fileUploadService.uploadFile(req.file);
      res.json(createResponse.success({ fileUrl: s3Url }));
    } catch (err) {
      console.error("Error uploading file:", err);
      const response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    }
  });
};
