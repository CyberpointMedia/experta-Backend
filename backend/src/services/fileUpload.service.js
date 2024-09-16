const  awsUtils  = require("../utils/aws.utlis");

exports.uploadFile = async (file) => {
  try {
    const s3Url = await awsUtils.uploadToS3(file);
    return s3Url;
  } catch (err) {
    throw err;
  }
};
