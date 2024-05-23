const BasicInfo = require("../models/basicInfo.model");
const Post = require("../models/post.model");

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
          basicInfo.posts.push(post._id);
          await basicInfo.save();
          resolve(data);
        } else resolve(null);
      })
      .catch((err) => {
        console.log(err.message);
        reject(err.message);
      });
  });
};
