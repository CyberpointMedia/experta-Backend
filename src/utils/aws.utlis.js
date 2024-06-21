const aws = require('aws-sdk');
const rimraf = require("rimraf");
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const shortId = require("shortid");

const s3Config = new aws.S3({
  accessKeyId: process.env.AWS_IAM_USER_KEY,
  secretAccessKey: process.env.AWS_IAM_USER_SECRET,
  region: process.env.AWS_REGION,
});

exports.deleteFile = async (fileuri) => {
  const fileKey = fileuri.split('/').slice(-2).join('/');
  return await s3Config
    .deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    })
    .promise();
};

