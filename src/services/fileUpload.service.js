const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_IAM_USER_KEY,
    secretAccessKey: process.env.AWS_IAM_USER_SECRET,
  },
  region: process.env.AWS_REGION,
});
const s3Config = new aws.S3({
  accessKeyId: process.env.AWS_IAM_USER_KEY,
  secretAccessKey: process.env.AWS_IAM_USER_SECRET,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
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

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `disputeVideo/${year}/${month}/${Date.now().toString()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
  } catch (err) {
    throw new Error(`Failed to upload file: ${err.message}`);
  }
};

const getVideoFiles = async () => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: "disputeVideo/",
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(params));
    const videoFiles = data.Contents.filter((file) =>
      file.Key.match(/\.(mp4|mov)$/)
    ).map((file) => ({
      key: file.Key,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
    }));
    return videoFiles;
  } catch (err) {
    throw new Error(`Failed to list video files: ${err.message}`);
  }
};

const uploadFile = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now().toString()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`;
  } catch (err) {
    throw new Error(`Failed to upload file: ${err.message}`);
  }
};

const deleteFile = async (fileUrl) => {
  const fileKey = fileUrl.split("/").slice(-1)[0];
  console.log(fileKey);
  // const deleteParams = {
  //   Bucket: process.env.AWS_BUCKET_NAME,
  //   Key: fileKey,
  // };
  try {
    await s3Config.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    });
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
