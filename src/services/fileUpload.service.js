const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const config = require("../config/config");

const s3Client = new S3Client({
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
  region: config.aws.region,
});
const s3Config = new aws.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: config.aws.bucketName,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

const uploadRecordingVideo = async (file) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleString('default', { month: 'long' });
  const timestamp = now.toISOString().replace(/[-:T.Z]/g, '');

  const params = {
    Bucket: config.aws.bucketName,
    Key: `disputeVideo/${year}/${month}/${timestamp}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${params.Key}`;
  } catch (err) {
    throw new Error(`Failed to upload file: ${err.message}`);
  }
};

const getVideoFiles = async () => {
  const params = {
    Bucket: config.aws.bucketName,
    Prefix: "disputeVideo/",
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(params));
    if (!data.Contents) {
      return [];
    }
    const videoFiles = data.Contents.filter((file) =>
      file.Key.match(/\.(mp4|mov)$/)
    ).map((file) => ({
      key: file.Key,
      url: `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${file.Key}`,
    }));
    return videoFiles;
  } catch (err) {
    throw new Error(`Failed to list video files: ${err.message}`);
  }
};

const uploadFile = async (file) => {
  const params = {
    Bucket: config.aws.bucketName,
    Key: `${Date.now().toString()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${config.aws.bucketName}.s3.amazonaws.com/${params.Key}`;
  } catch (err) {
    throw new Error(`Failed to upload file: ${err.message}`);
  }
};

const deleteFile = async (fileUrl) => {
  const fileKey = fileUrl.split("/").slice(-1)[0];
  console.log(fileKey);
  const params = {
    Bucket: config.aws.bucketName,
    Key: fileKey,
  };
  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    return { message: "File deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete file: ${err.message}`);
  }
};

module.exports = {
  upload,
  getVideoFiles,
  uploadRecordingVideo,
  uploadFile,
  deleteFile,
};