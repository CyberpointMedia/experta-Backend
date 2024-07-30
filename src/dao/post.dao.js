const BasicInfo = require("../models/basicInfo.model");
const Post = require("../models/post.model");
const Review = require("../models/review.model");

module.exports.getPostDetails = function (postId, type) {
  return new Promise((resolve, reject) => {
    Post.findOne({ _id: postId, type: type })
      .populate({
        path: "postedBy likes",
        populate: {
          path: "basicInfo",
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.createPost = function (postToSave, basicInfoId) {
  return new Promise((resolve, reject) => {
    const newPost = new Post(postToSave);
    newPost
      .save()
      .then(async (data) => {
        if (data) {
          const basicInfo = await BasicInfo.findById(basicInfoId);
          basicInfo.posts.push(data._id);
          await basicInfo.save();
          resolve(data);
        } else resolve(null);
      })
      .catch((err) => {
        console.log("error", err);
        reject(err.message);
      });
  });
};

module.exports.getAllPost = function (type, userId) {
  return new Promise((resolve, reject) => {
    Post.find({ type: type, postedBy: userId })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.createReview = function (reviewToSave, basicInfoId) {
  return new Promise((resolve, reject) => {
    const newReview = new Review(reviewToSave);
    newReview
      .save()
      .then(async (data) => {
        if (data) {
          const basicInfo = await BasicInfo.findById(basicInfoId);
          basicInfo.reviews.push(data._id);
          await basicInfo.save();
          resolve(data);
        } else resolve(null);
      })
      .catch((err) => {
        console.log("error", err);
        reject(err.message);
      });
  });
};

module.exports.getAllReview = function (userId) {
  return new Promise((resolve, reject) => {
    Review.find({ reviewBy: userId })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("error",err);
        reject(err);
      });
  });
};



module.exports.getAllReviewByUser = function (userId) {
  return new Promise((resolve, reject) => {
    Review.find({ reviewBy: userId })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("error", err);
        reject(err);
      });
  });
};
