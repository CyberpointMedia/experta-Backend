const FCMService = require("../utils/fcm.utils");
const Post = require("../models/post.model");
const BasicInfo = require("../models/basicInfo.model");
const Report = require("../models/report.model");
const ReportReason = require("../models/reportReason.model");
const errorMessageConstants = require("../constants/error.messages");
const createResponse = require("../utils/response");
const {deleteFile} = require("../utils/aws.utlis");

module.exports.likeUnlikePost = async (postId, userId) => {
  try {
    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
    }).populate('postedBy');
    if (!post) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Post Not Found",
      };
      return createResponse.error(response);
    }

    const isLiking = !post.likes.includes(userId);
    if (isLiking) {
      post.likes.push(userId);
      // Send notification only when liking, not when unliking
      if (post.postedBy._id.toString() !== userId.toString()) {
        const user = await BasicInfo.findOne({ user: userId , isDeleted: false}).select('firstName lastName displayName');
        const displayName = user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
        
        await FCMService.sendToUser(post.postedBy._id, {
          type: "POST_LIKE",
          sender: userId,
          title: "New Like",
          body: `${displayName} liked your post`,
          data: {
            postId: post._id.toString(),
            type: "POST_LIKE"
          }
        });
      }
    } else {
      const index = post.likes.indexOf(userId);
      post.likes.splice(index, 1);
    }

    const savedPost = await post.save();
    return createResponse.success(savedPost);
  } catch (error) {
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR,
      errorMessage: error.message,
    };
    return createResponse.error(response);
  }
};

module.exports.newComment = async (postId, userId, comment) => {
  try {
    const post = await Post.findOne({_id:postId, isDeleted:false }).populate('postedBy');
    if (!post) {
      const response = {
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Post Not Found",
      };
      return createResponse.error(response);
    }

    post.comments.push({
      user: userId,
      comment: comment,
    });
    
    const saveComment = await post.save();

    // Send notification to post owner if commenter is not the owner
    if (post.postedBy._id.toString() !== userId.toString()) {
      const user = await BasicInfo.findOne({ user: userId , isDeleted: false }).select('firstName lastName displayName');
      const displayName = user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      
      await FCMService.sendToUser(post.postedBy._id, {
        type: "POST_COMMENT",
        sender: userId,
        title: "New Comment",
        body: `${displayName} commented on your post: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        data: {
          postId: post._id.toString(),
          commentId: post.comments[post.comments.length - 1]._id.toString(),
          type: "POST_COMMENT"
        }
      });
    }

    // Populate and transform the comment data as before
    const populatedPost = await Post.findOne({_id:postId,isDeleted:false}).populate({
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

module.exports.deletePost = async function (postId, userId, basicInfoId) {
  try {
    const post = await Post.findOne({_id:postId, isDeleted:false});
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
    const basicInfo = await BasicInfo.findOne({ _id: basicInfoId , isDeleted: false});
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

module.exports.updateComment = async (postId, commentId, userId, comment) => {
  try {
    const post = await Post.findOne({_id:postId, isDeleted:false});
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
    const post = await Post.findOne({_id:postId, isDeleted:false});
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

