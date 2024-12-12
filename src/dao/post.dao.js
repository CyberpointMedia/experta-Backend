const BasicInfo = require("../models/basicInfo.model");
const Post = require("../models/post.model");
const Review = require("../models/review.model");
const Report=require("../models/report.model");
const ReportReason = require("../models/reportReason.model");


module.exports.createPost = function (postToSave, basicInfoId) {
  return new Promise((resolve, reject) => {
    const newPost = new Post(postToSave);
    newPost
      .save()
      .then(async (data) => {
        if (data) {
          const basicInfo = await BasicInfo.findOne(
            {
              _id: basicInfoId,
              isDeleted: false,
            }
          );
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

module.exports.createReview = function (reviewToSave, basicInfoId) {
  return new Promise((resolve, reject) => {
    const newReview = new Review(reviewToSave);
    newReview
      .save()
      .then(async (data) => {
        if (data) {
          const basicInfo = await BasicInfo.findOne({
            _id: basicInfoId,
            isDeleted: false,
          });
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
    Review.find({ reviewBy: userId , isDeleted:false })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("error", err);
        reject(err);
      });
  });
};

module.exports.getAllReviewByUser = function (userId) {
  return new Promise((resolve, reject) => {
    Review.find({ reviewBy: userId , isDeleted:false })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("error", err);
        reject(err);
      });
  });
};

module.exports.deleteReviewById = function (id) {
  return new Promise((resolve, reject) => {
    Review.findOneAndDelete({
      _id:id,
      isDeleted:false
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


module.exports.getReportReasons = function () {
  return new Promise((resolve, reject) => {
    ReportReason.find({isDeleted:false})
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getReportById = function (id) {
  return new Promise((resolve, reject) => {
    Report.findOne({
      _id:id,
      isDeleted:false
    })
      .populate("reportedBy")
      .populate("reason")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};


module.exports.deleteReportById = function (id) {
  return new Promise((resolve, reject) => {
    Report.findOneAndDelete({
      _id:id,
      isDeleted:false
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


module.exports.deleteReportReasonById = function (id) {
  return new Promise((resolve, reject) => {
    ReportReason.findOneAndDelete({
      _id:id,
      isDeleted:false
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


module.exports.getPostDetails = function (postId) {
  return new Promise((resolve, reject) => {
    Post.findOne({ _id: postId , isDeleted:false})
      .populate({
        path: "postedBy",
        populate: [
          { path: "basicInfo", select: "rating profilePic displayName" },
          {
            path: "industryOccupation",
            populate: [
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
            ]
          }
        ],
        select: "_id online",
      })
      .populate({
        path: "likes",
        populate: [
          { path: "basicInfo", select: "rating profilePic displayName" },
          {
            path: "industryOccupation",
            populate: [
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
            ]
          }
        ],
        select: "_id online",
      })
      .populate({
        path: "comments.user",
        populate: [
          { path: "basicInfo", select: "rating profilePic displayName" },
          {
            path: "industryOccupation",
            populate: [
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
            ]
          }
        ],
        select: "_id online",
      })
      .then((post) => {
        if (!post) {
          return resolve(null);
        }

        const transformUser = (user) => {
          if (!user) return null;
          return {
            id: user._id || "",
            online: user.online || false,
            rating: user.basicInfo?.rating || "",
            profilePic: user.basicInfo?.profilePic || "",
            displayName: user.basicInfo?.displayName || "",
            level1: user.industryOccupation?.level1Service?.name || "",
            level2: user.industryOccupation?.level2Service?.name || "",
            level3: user.industryOccupation?.level3Services?.map(service => service.name) || []
          };
        };

        const transformedPost = {
          type: post.type,
          id: post._id,
          formattedDate: post?.formattedDate,
          image: post?.image,
          caption: post?.caption,
          postedBy: transformUser(post.postedBy),
          likes: post.likes.map(transformUser).filter(Boolean),
          comments: post.comments.map((comment) => ({
            comment: comment.comment,
            formattedDate: comment?.formattedDate,
            _id: comment._id,
            user: transformUser(comment.user),
          })),
          totalLikes: post.likes.length,
          totalComments: post.comments.length,
        };

        resolve(transformedPost);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getAllPost = function (type, userId) {
  return new Promise((resolve, reject) => {
    Post.find({ type: type, postedBy: userId , isDeleted:false })
      .populate({
        path: "postedBy",
        populate: [
          { path: "basicInfo", select: "rating profilePic displayName" },
          {
            path: "industryOccupation",
            populate: [
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
            ]
          }
        ],
        select: "_id online",
      })
      .populate({
        path: "likes",
        populate: [
          { path: "basicInfo", select: "rating profilePic displayName" },
          {
            path: "industryOccupation",
            populate: [
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
            ]
          }
        ],
        select: "_id online",
      })
      .populate({
        path: "comments.user",
        populate: [
          { path: "basicInfo", select: "rating profilePic displayName" },
          {
            path: "industryOccupation",
            populate: [
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
            ]
          }
        ],
        select: "_id online",
      })
      .then((posts) => {
        if (!posts) {
          return resolve(null);
        }

        const transformUser = (user) => {
          if (!user) return null;
          return {
            id: user._id || "",
            online: user.online || false,
            rating: user.basicInfo?.rating || "",
            profilePic: user.basicInfo?.profilePic || "",
            displayName: user.basicInfo?.displayName || "",
            level1: user.industryOccupation?.level1Service?.name || "",
            level2: user.industryOccupation?.level2Service?.name || "",
            level3: user.industryOccupation?.level3Services?.map(service => service.name) || []
          };
        };

        const transformedPosts = posts.map((post) => ({
          type: post.type,
          id: post._id,
          formattedDate: post?.formattedDate,
          image: post?.image,
          caption: post?.caption,
          postedBy: transformUser(post.postedBy),
          likes: post.likes.map(transformUser).filter(Boolean),
          comments: post.comments.map((comment) => ({
            comment: comment.comment,
            formattedDate: comment?.formattedDate,
            _id: comment._id,
            createdAt: comment.createdAt,
            user: transformUser(comment.user),
          })),
          totalLikes: post.likes.length,
          totalComments: post.comments.length,
        }));

        resolve(transformedPosts);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getAllRandomPost = function (type) {
  return new Promise((resolve, reject) => {
    Post.find({ type: type , isDeleted:false})
      .populate({
        path: "postedBy",
        populate: [
          { path: "basicInfo", select: "rating profilePic displayName" },
          {
            path: "industryOccupation",
            populate: [
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
            ]
          }
        ],
        select: "_id online",
      })
      .populate({
        path: "likes",
        populate: [
          { path: "basicInfo", select: "rating profilePic displayName" },
          {
            path: "industryOccupation",
            populate: [
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
            ]
          }
        ],
        select: "_id online",
      })
      .populate({
        path: "comments.user",
        populate: [
          { path: "basicInfo", select: "rating profilePic displayName" },
          {
            path: "industryOccupation",
            populate: [
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
            ]
          }
        ],
        select: "_id online",
      })
      .then((posts) => {
        if (!posts || posts.length === 0) {
          return resolve(null);
        }

        const transformUser = (user) => {
          if (!user) return null;
          return {
            id: user._id || "",
            online: user.online || false,
            rating: user.basicInfo?.rating || "",
            profilePic: user.basicInfo?.profilePic || "",
            displayName: user.basicInfo?.displayName || "",
            level1: user.industryOccupation?.level1Service?.name || "",
            level2: user.industryOccupation?.level2Service?.name || "",
            level3: user.industryOccupation?.level3Services?.map(service => service.name) || []
          };
        };

        const transformedPosts = posts.map((post) => ({
          type: post.type,
          id: post._id,
          formattedDate: post?.formattedDate,
          image: post?.image,
          caption: post?.caption,
          postedBy: transformUser(post.postedBy),
          likes: post.likes.map(transformUser).filter(Boolean),
          comments: post.comments.map((comment) => ({
            comment: comment.comment,
            formattedDate: comment?.formattedDate,
            _id: comment._id,
            createdAt: comment.createdAt,
            user: transformUser(comment.user),
          })),
          totalLikes: post.likes.length,
          totalComments: post.comments.length,
        }));

        // Randomize the order of posts
        for (let i = transformedPosts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [transformedPosts[i], transformedPosts[j]] = [
            transformedPosts[j],
            transformedPosts[i],
          ];
        }

        resolve(transformedPosts);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};