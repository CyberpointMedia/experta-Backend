const errorMessageConstants = require("../constants/error.messages");
const globalConstants = require("../constants/global-constants");

const jwtUtil = require("../utils/jwt.utils");

const authService = require("../services/auth.service");
const userService = require("../services/user.service");

const createResponse = require("../utils/response");

const { AuthenticationError } = require("../errors/custom.error");

const userDao = require("../dao/user.dao");
const postDao = require("../dao/post.dao");
const BasicInfo = require("../models/basicInfo.model");
const postService = require("../services/post.service");

exports.createPost = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }

  if (!req?.file) {
    res.send(createResponse.invalid("Post cannot be empty"));
    return;
  }

  if (!!req?.file) {
    data = {
      url: req.file.location,
      type: req.file.mimetype,
    };
  }

  try {
    const postToSave = {
      image: data.url,
      caption: req.body.caption,
      location: req.body.location, // example [45.5236, -122.6750],
      postedBy: userId,
      type: req.body.type,
    };
    postDao
      .createPost(postToSave, req.body.basicInfoId)
      .then((data) => {
        if (null != data) {
          res.json(createResponse.success(data));
        } else {
          response = {
            errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
            errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
          };
          res.json(createResponse.error(response));
        }
      })
      .catch((err) => {
        console.log(err);
        response = {
          errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
          errorMessage: err,
        };
        res.json(createResponse.error(response));
      });
  } catch (e) {
    console.log(e);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: e,
    };
    res.json(createResponse.error(response));
  }
};

exports.likeUnlikePost = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const postId = req.params.id;
    if (!userId) {
      res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
      return;
    }
    if (!postId) {
      res.send(createResponse.invalid(errorMessageConstants.POST_REQUIRED_ID));
      return;
    }
    const savedLikes = await postService.likeUnlikePost(postId, userId);
    res.json(savedLikes);
    return;
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.getPostDetails = async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  postDao
    .getPostDetails(postId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.getAllPost = async (req, res) => {
  const { userId, type } = req.body;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  if (!type) {
    res.send(createResponse.invalid("Type cannot be empty"));
    return;
  }
  console.log("all post--> enter", req.body);
  postDao
    .getAllPost(type, userId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.newComment = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const postId = req.params.id;
    const comment = req.body.comment;
    if (!userId) {
      res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
      return;
    }
    if (!postId) {
      res.send(createResponse.invalid(errorMessageConstants.POST_REQUIRED_ID));
      return;
    }
    const savedComment = await postService.newComment(postId, userId, comment);
    res.json(savedComment);
    return;
  } catch (error) {
    console.log(error.message);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

exports.updateComment = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const postId = req.body.postId;
    const commentId = req.body.commentId;
    const comment = req.body.comment;

    if (!userId) {
      res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
      return;
    }
    if (!postId) {
      res.send(createResponse.invalid(errorMessageConstants.POST_REQUIRED_ID));
      return;
    }
    if (!commentId) {
      res.send(
        createResponse.invalid(errorMessageConstants.COMMENT_REQUIRED_ID)
      );
      return;
    }
    if (!comment) {
      res.send(createResponse.invalid(errorMessageConstants.REQUIRED_COMMENT));
      return;
    }

    const updatedComment = await postService.updateComment(
      postId,
      commentId,
      userId,
      comment
    );
    res.json(updatedComment);
    return;
  } catch (error) {
    console.log(error.message);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};



exports.getAllReviews = async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  postDao
    .getAllReview(userId)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
          errorMessage: errorMessageConstants.DATA_NOT_FOUND,
        };
        res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      res.json(createResponse.error(response));
    });
};

exports.createReview = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }

  try {
    const reviewToSave = {
      rating: req.body.rating,
      review: req.body.review,
      reviewBy: userId,
    };
    postDao
      .createReview(reviewToSave, req.body.basicInfoId)
      .then((data) => {
        if (null != data) {
          res.json(createResponse.success(data));
        } else {
          response = {
            errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_COde,
            errorMessage: errorMessageConstants.UNABLE_TO_SAVE_MESSAGE,
          };
          res.json(createResponse.error(response));
        }
      })
      .catch((err) => {
        console.log(err);
        response = {
          errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
          errorMessage: err,
        };
        res.json(createResponse.error(response));
      });
  } catch (e) {
    console.log(e);
    response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: e,
    };
    res.json(createResponse.error(response));
  }
};

exports.deleteReviewById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  postDao
    .deleteReviewById(id)
    .then((data) => {
      if (null != data) {
        res.json(createResponse.success(data));
      } else {
        response = {
          errorCode: errorMessageConstants.UPDATE_NOT_DONE_ERROR_COde,
          errorMessage: errorMessageConstants.UNABLE_TO_DELETE_MESSAGE,
        };
        return res.json(createResponse.error(response));
      }
    })
    .catch((err) => {
      console.log(err.message);
      response = {
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: err.message,
      };
      return res.json(createResponse.error(response));
    });
};



exports.deleteComment = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const postId = req.body.postId;
    const commentId = req.body.commentId;

    if (!userId) {
      res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
      return;
    }
    if (!postId) {
      res.send(createResponse.invalid(errorMessageConstants.POST_REQUIRED_ID));
      return;
    }
    if (!commentId) {
      res.send(
        createResponse.invalid(errorMessageConstants.COMMENT_REQUIRED_ID)
      );
      return;
    }

    const deletedComment = await postService.deleteComment(
      postId,
      commentId,
      userId
    );
    res.json(deletedComment);
    return;
  } catch (error) {
    console.log(error.message);
    const response = {
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    };
    res.json(createResponse.error(response));
  }
};

