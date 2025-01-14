const fileUploadService = require("../services/fileUpload.service");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");

exports.uploadFile = (req, res) => {
  fileUploadService.upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json(
        createResponse.error({
          errorCode: errorMessageConstants.BAD_REQUEST,
          errorMessage: err.message,
        })
      );
    }

    if (!req.file) {
      return res.status(400).json(
        createResponse.error({
          errorCode: errorMessageConstants.BAD_REQUEST,
          errorMessage: "No file uploaded",
        })
      );
    }

    try {
      const s3Url = req.file.location; // multer-s3 already uploaded the file
      res.json(createResponse.success({ fileUrl: s3Url }));
    } catch (err) {
      console.error("Error processing uploaded file:", err);
      res.status(500).json(
        createResponse.error({
          errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
          errorMessage: err.message,
        })
      );
    }
  });
};
exports.uploadRecordingVideo = (req, res) => {
  fileUploadService.recordFileUpload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json(
        createResponse.error({
          errorCode: errorMessageConstants.BAD_REQUEST,
          errorMessage: err.message,
        })
      );
    }

    if (!req.file) {
      return res.status(400).json(
        createResponse.error({
          errorCode: errorMessageConstants.BAD_REQUEST,
          errorMessage: "No file uploaded",
        })
      );
    }

    try {
      const s3Url = await fileUploadService.uploadRecordingVideo(req.file);
      res.json(createResponse.success({ fileUrl: s3Url }));
    } catch (err) {
      console.error("Error processing uploaded file:", err);
      res.status(500).json(
        createResponse.error({
          errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
          errorMessage: err.message,
        })
      );
    }
  });
};

exports.deleteFile = async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json(
      createResponse.error({
        errorCode: errorMessageConstants.BAD_REQUEST,
        errorMessage: "File URL is required",
      })
    );
  }

  try {
    const result = await fileUploadService.deleteFile(fileUrl);
    res.json(createResponse.success(result));
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      })
    );
  }
};

exports.getVideoFiles = async (req, res) => {
  try {
    const videoFiles = await fileUploadService.getVideoFiles();
    res.json(createResponse.success(videoFiles));
  } catch (err) {
    console.error("Error fetching video files:", err);
    res.status(500).json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      })
    );
  }
};