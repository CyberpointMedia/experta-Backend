const customError = require("../errors/custom.error");
const globalConstants = require("../constants/global-constants");


const BasicInfo = require("../models/basicInfo.model");

const Post = require("../models/post.model");
const errorMessageConstants = require("../constants/error.messages");
const createResponse = require("../utils/response");

module.exports.likeUnlikePost = async (postId, userId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Post Not Found",
      };
      return createResponse.error(response);
    }
    if (post.likes.includes(userId)) {
      const index = post.likes.indexOf(userId);
      post.likes.splice(index, 1);
      const savedPost = await post.save();
      return createResponse.success(savedPost);
    } else {
      post.likes.push(userId);
      const savedPost = await post.save();
      return createResponse.success(savedPost);
    }
  } catch (error) {
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.deletePost = async function (postId, userId,basicInfoId) {
  try {
    const post = await Post.findById(postId);
    if (!post) {
       const response = {
         errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
         errorMessage: "Post Not Found",
       };
       return createResponse.error(response);
    }
    if (post.postedBy.toString() !== userId.toString()) {
      const response = {
        errorCode: errorMessageConstants.UNAUTHORISED_ERROR_CODE,
        errorMessage: "Unauthorized",
      };
      return createResponse.error(response);
    }
    await deleteFile(post.image);
    await post.remove();
    const basicInfo = await BasicInfo.findById(basicInfoId);
    if (basicInfo) {
      const index = basicInfo.posts.indexOf(postId);
      if (index > -1) {
        basicInfo.posts.splice(index, 1);
        await basicInfo.save();
      }
    }
    return createResponse.success(post);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};
