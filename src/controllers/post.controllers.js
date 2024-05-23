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

  if (!req.body.image) {
    res.send(createResponse.invalid("Post cannot be empty"));
    return;
  }

  try {
    const postToSave = new Post({
      image: req.body.image,
      caption: req.body.caption,
      location: {
        type: "Point",
        coordinates: req.body.coordinates, // example [45.5236, -122.6750]
      },
      postedBy: userId,
    });
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
  const userId = req.body.user._id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  const { postId, type } = req.body;
  postDao
    .getPostDetails(postId, type)
    .then((data) => {
      if (null != data && data.basicInfo) {
        res.json(createResponse.success(data.basicInfo));
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
