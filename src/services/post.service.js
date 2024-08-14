const customError = require("../errors/custom.error");
const globalConstants = require("../constants/global-constants");

const BasicInfo = require("../models/basicInfo.model");
const Report = require("../models/report.model");
const ReportReason = require("../models/reportReason.model");


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

module.exports.deletePost = async function (postId, userId, basicInfoId) {
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

module.exports.newComment = async (postId, userId, comment) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Post Not Found",
      };
      return createResponse.error(response);
    }
    if (post.comments.includes(userId)) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Already commneted",
      };
      return createResponse.error(response);
    }
    post.comments.push({
      user: userId,
      comment: comment,
    });
    const saveComment = await post.save();

    // Populate the user information for the new comment
    const populatedPost = await Post.findById(postId).populate({
      path: 'comments.user',
      populate: [
        { path: 'basicInfo', select: 'rating profilePic displayName' },
        {
          path: 'industryOccupation',
          populate: [
            { path: 'industry', select: 'name' },
            { path: 'occupation', select: 'name' },
          ],
        },
      ],
      select: '_id online',
    });



    // Transform the comments to include detailed user information
    const transformedComments = populatedPost.comments.map(comment => ({
      comment: comment.comment,
      formattedDate: comment.formattedDate || 'some time ago',
      _id: comment._id,
      user: {
        id: comment.user._id || "",
        online: comment.user.online || false,
        rating: comment.user.basicInfo?.rating || "",
        profilePic: comment.user.basicInfo?.profilePic || "",
        displayName: comment.user.basicInfo?.displayName || "",
        industry: comment.user.industryOccupation?.industry?.name || "",
        occupation: comment.user.industryOccupation?.occupation?.name || "",
      },
    }));
    return createResponse.success(transformedComments);
  } catch (error) {
    console.log("error", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.updateComment = async (postId, commentId, userId, comment) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Post Not Found",
      };
      return createResponse.error(response);
    }

    const commentToUpdate = post.comments.id(commentId);
    if (!commentToUpdate) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Comment Not Found",
      };
      return createResponse.error(response);
    }

    // Check if the comment belongs to the user
    if (commentToUpdate.user.toString() !== userId) {
      const response = {
        errorCode: errorMessageConstants.UNAUTHORIZED_ERROR_CODE,
        errorMessage: "User not authorized to update this comment",
      };
      return createResponse.error(response);
    }

    commentToUpdate.comment = comment;
    const saveComment = await post.save();
    return createResponse.success(saveComment);
  } catch (error) {
    console.log("error", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};


module.exports.deleteComment = async (postId, commentId, userId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Post Not Found",
      };
      return createResponse.error(response);
    }

    const commentToDelete = post.comments.id(commentId);
    if (!commentToDelete) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Comment Not Found",
      };
      return createResponse.error(response);
    }

    // Check if the comment belongs to the user
    if (commentToDelete.user.toString() !== userId) {
      const response = {
        errorCode: errorMessageConstants.UNAUTHORIZED_ERROR_CODE,
        errorMessage: "User not authorized to delete this comment",
      };
      return createResponse.error(response);
    }

    post.comments.pull({ _id: commentId });
    const savePost = await post.save();
    return createResponse.success(savePost);
  } catch (error) {
    console.log("error", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};


module.exports.createReport = async function (reportData) {
  try {
    const newReport = new Report(reportData);
    const savedReport = await newReport.save();
    return createResponse.success(savedReport);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.createReportReason = async function (reasonData) {
  try {
    const newReason = new ReportReason(reasonData);
    const savedReason = await newReason.save();
    return createResponse.success(savedReason);
  } catch (error) {
    console.error("Error:", error);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

