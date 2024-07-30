const errorMessageConstants = require("../constants/error.messages");

const createResponse = require("../utils/response");
const BasicInfo = require("../models/basicInfo.model");
const IndustryOccupation = require("../models/industryOccupation.model");
const Expertise = require("../models/expertise.model");
const ExpertiseItemModel = require("../models/expertiseItem.model");

const WorkExperience = require("../models/workExperience.model");
const About = require("../models/about.model");
const InterestItemsModel = require("../models/interestItems.model");
const Interest = require("../models/interest.model");
const LanguageItemsModel = require("../models/languageItems.model");
const Languages = require("../models/languages.model");
const Pricing = require("../models/pricing.model");
const Availability = require("../models/availability.model");
const UserAccount = require("../models/account.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const Post = require("../models/post.model");
const Feed = require("../models/feed.model");
const Policy = require("../models/policy.model");
const interestItemsModel = require("../models/interestItems.model");
const Category = require("../models/category.model");
const Education = require("../models/education.model");
const IndustryModel = require("../models/industry.model");
const OccupationModel = require("../models/occupation.model");

module.exports.getUserDetailsById = function (id) {
  return new Promise((resolve, reject) => {
    user
      .findOne({ where: { id: id } })
      .then(async (data) => {
        if (null != data) {
          data.dataValues["roles"] = await this.getUserRolesById(data.id);
        }
        resolve(data.dataValues);
      })
      .catch((err) => {
        console.log(err);
        reject(err.message);
      });
  });
};

module.exports.getEmailById = async function (id) {
  let userData = await user.findByPk(id);
  if (null != userData) {
    return userData.email;
  } else {
    return userData;
  }
};

module.exports.getUserById = async function (id) {
  let userData = await user.findByPk(id);
  if (null != userData) {
    return userData;
  } else {
    return null;
  }
};

module.exports.getBasicInfo = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate("basicInfo")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getIndustryOccupation = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate({
        path: "industryOccupation",
        populate: { path: "industry occupation" },
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

module.exports.createBasicInfo = function (basicInfoToSave) {
  return new Promise((resolve, reject) => {
    const newBasicInfo = new BasicInfo(basicInfoToSave);
    newBasicInfo
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err.message);
        reject(err.message);
      });
  });
};

// module.exports.getIndustryOccupation = function (userId) {
//   return new Promise((resolve, reject) => {
//     IndustryOccupation.findOne({ user: userId })
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((err) => {
//         console.log(err);
//         reject(err);
//       });
//   });
// };

module.exports.getExpertise = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate({
        path: "expertise",
        populate: { path: "expertise" },
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

module.exports.createExpertiseItem = function (name) {
  return new Promise((resolve, reject) => {
    const newExpertise = new ExpertiseItemModel({ name });
    newExpertise
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err.message);
        reject(err.message);
      });
  });
};

module.exports.getExpertiseItem = function () {
  return new Promise((resolve, reject) => {
    ExpertiseItemModel.find({})
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getEducation = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate("education")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getEducationById = function (id) {
  return new Promise((resolve, reject) => {
    Education.findOne({ _id: id })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.deleteEducationById = function (id) {
  return new Promise((resolve, reject) => {
    Education.findByIdAndDelete(id)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.deleteAvailabilityById = function (id) {
  return new Promise((resolve, reject) => {
    Availability.findByIdAndDelete(id)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getWorkExperience = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate("workExperience")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getWorkExperienceById = function (id) {
  return new Promise((resolve, reject) => {
    WorkExperience.findOne({ _id: id })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.deleteWorkExperienceById = function (id) {
  return new Promise((resolve, reject) => {
    WorkExperience.findByIdAndDelete(id)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getUserAbout = function (userId) {
  return new Promise((resolve, reject) => {
    About.findOne({ user: userId })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getUserInterest = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate({
        path: "intereset",
        populate: { path: "intereset" },
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

module.exports.getUserInterestItems = function () {
  return new Promise((resolve, reject) => {
    InterestItemsModel.find({})
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.createInterestItem = function (name) {
  return new Promise((resolve, reject) => {
    const newInterest = new InterestItemsModel({ name });
    newInterest
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err.message);
        reject(err.message);
      });
  });
};

// langauge

module.exports.getAllLanguages = function () {
  return new Promise((resolve, reject) => {
    LanguageItemsModel.find({})
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.addLanguages = function (name) {
  return new Promise((resolve, reject) => {
    const newLanguage = new LanguageItemsModel({ name });
    newLanguage
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err.message);
        reject(err.message);
      });
  });
};

module.exports.getUserLanguages = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate({
        path: "language",
        populate: { path: "language" },
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

module.exports.getUserPricing = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate("pricing")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getUserAvailability = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate("availability")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getUserAvailabilityId = function (id) {
  return new Promise((resolve, reject) => {
    Availability.findOne({ _id: id })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getAccountSetting = function (userId) {
  return new Promise((resolve, reject) => {
    UserAccount.findOne({ user: userId })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

// module.exports.getUserData = function (userId) {
//   return new Promise(async (resolve, reject) => {
//     User.aggregate([
//       { $match: { _id: new mongoose.Types.ObjectId(userId) } },
//       {
//         $lookup: {
//           from: "basicinfos",
//           localField: "_id",
//           foreignField: "user",
//           as: "basicInfo",
//         },
//       },
//       {
//         $lookup: {
//           from: "educations",
//           localField: "_id",
//           foreignField: "user",
//           as: "education",
//         },
//       },
//       {
//         $lookup: {
//           from: "availabilities",
//           localField: "_id",
//           foreignField: "user",
//           as: "availability",
//         },
//       },
//       {
//         $lookup: {
//           from: "abouts",
//           localField: "_id",
//           foreignField: "user",
//           as: "about",
//         },
//       },
//       {
//         $lookup: {
//           from: "pricings",
//           localField: "_id",
//           foreignField: "user",
//           as: "pricing",
//         },
//       },
//       {
//         $lookup: {
//           from: "useraccounts",
//           localField: "_id",
//           foreignField: "user",
//           as: "userAccount",
//         },
//       },
//       {
//         $lookup: {
//           from: "expertise",
//           localField: "_id",
//           foreignField: "user",
//           as: "expertise",
//         },
//       },
//       {
//         $lookup: {
//           from: "interests",
//           localField: "_id",
//           foreignField: "user",
//           as: "interest",
//         },
//       },
//       {
//         $lookup: {
//           from: "industryoccupations",
//           localField: "_id",
//           foreignField: "user",
//           as: "industryOccupation",
//         },
//       },
//       {
//         $lookup: {
//           from: "workexperiences",
//           localField: "_id",
//           foreignField: "user",
//           as: "workExperience",
//         },
//       },
//       { $unwind: { path: "$basicInfo", preserveNullAndEmptyArrays: true } },
//       { $unwind: { path: "$education", preserveNullAndEmptyArrays: true } },
//       { $unwind: { path: "$about", preserveNullAndEmptyArrays: true } },
//       { $unwind: { path: "$userAccount", preserveNullAndEmptyArrays: true } },
//       { $unwind: { path: "$availability", preserveNullAndEmptyArrays: true } },
//       { $unwind: { path: "$pricing", preserveNullAndEmptyArrays: true } },
//       {
//         $unwind: {
//           path: "$industryOccupation",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $unwind: { path: "$workExperience", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: "expertiseitems",
//           localField: "expertise.expertise",
//           foreignField: "_id",
//           as: "expertise.expertiseItems",
//         },
//       },
//       {
//         $lookup: {
//           from: "interestitems",
//           localField: "interest.intereset",
//           foreignField: "_id",
//           as: "interest.interestItems",
//         },
//       },
//       {
//         $project: {
//           firstName: 1,
//           lastName: 1,
//           email: 1,
//           phoneNo: 1,
//           about: "$about.about",
//           username: "$userAccount.username",
//           dateOfBirth: "$userAccount.dateOfBirth",
//           gender: "$userAccount.gender",
//           basicInfo: {
//             _id: "$basicInfo._id",
//             name: "$basicInfo.name",
//             displayName: "$basicInfo.displayName",
//             bio: "$basicInfo.bio",
//             facebook: "$basicInfo.facebook",
//             linkedin: "$basicInfo.linkedin",
//             instagram: "$basicInfo.instagram",
//             twitter: "$basicInfo.twitter",
//           },
//           education: {
//             _id: "$education._id",
//             education: "$education.education",
//           },
//           availability: {
//             _id: "$availability._id",
//             slots: "$availability.slots",
//           },
//           expertise: {
//             _id: "$expertise._id",
//             expertise: "$expertise.expertiseItems.name",
//           },
//           workExperience: {
//             _id: "$workExperience._id",
//             expertise: "$workExperience.workExperience",
//           },
//           interest: {
//             _id: "$interest._id",
//             interest: "$interest.interestItems.name",
//           },
//           pricing: {
//             _id: "$pricing._id",
//             audioCallPrice: "$pricing.audioCallPrice",
//             videoCallPrice: "$pricing.videoCallPrice",
//             messagePrice: "$pricing.messagePrice",
//           },

//           industryOccupation: {
//             _id: "$industryOccupation._id",
//             industry: "$industryOccupation.industry",
//             occupation: "$industryOccupation.occupation",
//             registrationNumber: "$industryOccupation.registrationNumber",
//             certificate: "$industryOccupation.certificate",
//             achievements: "$industryOccupation.achievements",
//           },
//         },
//       },
//     ])
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((err) => {
//         console.log(err);
//         reject(err);
//       });
//   });
// };

module.exports.followersandfollowing = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate({
        path: "basicInfo",
        select: "following followers",
        populate: {
          path: "following followers",
          select: "_id online industryOccupation",
          populate: [
            {
              path: "basicInfo",
              select: "rating profilePic displayName",
            },
            {
              path: "industryOccupation",
              select: "industry occupation",
              populate: [
                { path: "industry", select: "name" },
                { path: "occupation", select: "name" },
              ],
            },
          ],
        },
      })
      .then((data) => {
        const { following, followers } = data.basicInfo;

        Promise.all(
          following.map(
            (user) =>
              new Promise((resolve) => {
                const filteredUser = {
                  id: user?._id || "",
                  online: user?.online || false,
                  rating: user?.basicInfo?.rating || "",
                  profilePic: user?.basicInfo?.profilePic || "",
                  displayName: user?.basicInfo?.displayName || "",
                  industry: user?.industryOccupation?.industry?.name || "",
                  occupation: user?.industryOccupation?.occupation?.name || "",
                };
                resolve(filteredUser);
              })
          )
        )
          .then((filteredFollowing) =>
            Promise.all(
              followers.map(
                (user) =>
                  new Promise((resolve) => {
                    const filteredUser = {
                      id: user?._id || "",
                      online: user?.online || false,
                      rating: user?.basicInfo?.rating || "",
                      profilePic: user?.basicInfo?.profilePic || "",
                      displayName: user?.basicInfo?.displayName || "",
                      industry: user?.industryOccupation?.industry?.name || "",
                      occupation:
                        user?.industryOccupation?.occupation?.name || "",
                    };
                    resolve(filteredUser);
                  })
              )
            ).then((filteredFollowers) => {
              resolve({
                following: filteredFollowing,
                followers: filteredFollowers,
              });
            })
          )
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getPosts = function (userId) {
  return new Promise((resolve, reject) => {
    Post.find({ user: userId })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getFeeds = function (userId) {
  return new Promise((resolve, reject) => {
    Feed.find({ user: userId })
      .populate("likes")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getPolicy = function (userId) {
  return new Promise((resolve, reject) => {
    Policy.findOne({ user: userId })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.createPolicy = function (policyToSave) {
  return new Promise((resolve, reject) => {
    const newPolicyToSave = new Policy(policyToSave);
    newPolicyToSave
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err.message);
        reject(err.message);
      });
  });
};

module.exports.getUserData = function (userId, ownUserId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId })
      .populate("education")
      .populate({
        path: "industryOccupation",
        populate: { path: "industry occupation" },
      })
      .populate({
        path: "basicInfo",
        populate: { path: "posts" },
      })
      .populate({
        path: "basicInfo",
        populate: { path: "reviews" },
      })
      .populate("workExperience")
      .populate({
        path: "intereset",
        populate: { path: "intereset" },
      })
      .populate({
        path: "language",
        populate: { path: "language" },
      })
      // .populate({
      //   path: "reviews",
      //   populate: { path: "reviews" },
      // })
      .populate({
        path: "expertise",
        populate: { path: "expertise" },
      })
      .populate("pricing")
      .then(async (data) => {
        if (data && data.basicInfo) {
          // Check if ownUserId is in the followers array of the found user
          const isFollowing = data.basicInfo.following.some(
            (followerId) => followerId.toString() === ownUserId
          );

          // Add isFollowing field to the data object
          const result = data.toObject(); // Convert to a plain JavaScript object
          result.isFollowing = isFollowing;
          const ownUser = await User.findById(ownUserId);
          result.isBlocked = ownUser.blockedUsers.includes(userId);
          resolve(result);
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getTrending = function () {
  return new Promise((resolve, reject) => {
    User.find({})
      .select(
        "_id online rating profilePic displayName industryOccupation pricing"
      )
      .populate({
        path: "industryOccupation",
        populate: [
          { path: "industry", select: "name" },
          { path: "occupation", select: "name" },
        ],
      })
      .populate("pricing")
      .populate("basicInfo")
      .then((data) => {
        Promise.all(
          data.map(
            (user) =>
              new Promise((resolve) => {
                const filteredUser = {
                  id: user?._id || "",
                  online: user?.online || false,
                  rating: user?.basicInfo?.rating || "",
                  profilePic: user?.basicInfo?.profilePic || "",
                  displayName: user?.basicInfo?.displayName || "",
                  industry: user?.industryOccupation?.industry?.name || "",
                  occupation: user?.industryOccupation?.occupation?.name || "",
                  pricing: user?.pricing || {
                    _id: "",
                    _v: 0,
                    audioCallPrice: 0,
                    messagePrice: 0,
                    videoCallPrice: 0,
                  },
                };
                resolve(filteredUser);
              })
          )
        )
          .then((filteredData) => {
            resolve(filteredData);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getUserBySearch = function (query) {
  return new Promise(async (resolve, reject) => {
    const aggregationPipeline = [
      {
        $lookup: {
          from: "basicinfos",
          localField: "basicInfo",
          foreignField: "_id",
          as: "basicInfo",
        },
      },
      {
        $lookup: {
          from: "industryoccupations",
          localField: "industryOccupation",
          foreignField: "_id",
          as: "industryOccupation",
        },
      },
      {
        $lookup: {
          from: "industries",
          localField: "industryOccupation.industry",
          foreignField: "_id",
          as: "industry",
        },
      },
      {
        $lookup: {
          from: "occupations",
          localField: "industryOccupation.occupation",
          foreignField: "_id",
          as: "occupation",
        },
      },
      {
        $lookup: {
          from: "interests",
          localField: "intereset",
          foreignField: "_id",
          as: "interest",
        },
      },
      {
        $lookup: {
          from: "interestitems",
          localField: "interest.intereset",
          foreignField: "_id",
          as: "interestItems",
        },
      },
      {
        $match: query
          ? {
              $or: [
                { "basicInfo.firstName": { $regex: query, $options: "i" } },
                { "basicInfo.lastName": { $regex: query, $options: "i" } },
                { "basicInfo.displayName": { $regex: query, $options: "i" } },
                { "industry.name": { $regex: query, $options: "i" } },
                { "occupation.name": { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { "interestItems.name": { $regex: query, $options: "i" } },
              ],
            }
          : {}, // If query is empty, match all documents,
      },
      {
        $addFields: {
          sortOrder: {
            $cond: [{ $eq: ["$isVerified", true] }, 0, 1],
          },
          randomValue: { $rand: {} },
        },
      },
      {
        $sort: {
          sortOrder: 1,
          noOfBooking: -1,
          randomValue: 1,
        },
      },
      {
        $project: {
          _id: 1,
          online: { $ifNull: ["$online", false] },
          isVerified: { $ifNull: ["$isVerified", false] },
          noOfBooking: { $ifNull: ["$noOfBooking", 0] },
          rating: { $ifNull: [{ $arrayElemAt: ["$basicInfo.rating", 0] }, ""] },
          profilePic: {
            $ifNull: [{ $arrayElemAt: ["$basicInfo.profilePic", 0] }, ""],
          },
          displayName: {
            $ifNull: [{ $arrayElemAt: ["$basicInfo.displayName", 0] }, ""],
          },
          lastName: {
            $ifNull: [{ $arrayElemAt: ["$basicInfo.lastName", 0] }, ""],
          },
          firstName: {
            $ifNull: [{ $arrayElemAt: ["$basicInfo.firstName", 0] }, ""],
          },
          industry: { $ifNull: [{ $arrayElemAt: ["$industry.name", 0] }, ""] },
          occupation: {
            $ifNull: [{ $arrayElemAt: ["$occupation.name", 0] }, ""],
          },
        },
      },
    ];

    // todo:add random
    await User.aggregate(aggregationPipeline)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getCategories = function (userId) {
  return new Promise((resolve, reject) => {
    Category.find({})
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getIndustry = function () {
  return new Promise((resolve, reject) => {
    IndustryModel.find({})
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getOccupation = function (industryId) {
  return new Promise((resolve, reject) => {
    OccupationModel.find({ industry: industryId })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getUserByIndustry = function (industryId) {
  return new Promise(async (resolve, reject) => {
    const industryOccupations = await IndustryOccupation.find({
      industry: industryId,
    }).select("_id");
    const industryOccupationIds = industryOccupations.map((io) => io._id);
    User.find({ industryOccupation: { $in: industryOccupationIds } })
      .select(
        "_id online rating profilePic displayName industryOccupation pricing"
      )
      .populate({
        path: "industryOccupation",
        populate: [
          { path: "industry", select: "name" },
          { path: "occupation", select: "name" },
        ],
      })
      .populate("pricing")
      .populate("basicInfo")
      .then((data) => {
        Promise.all(
          data.map(
            (user) =>
              new Promise((resolve) => {
                const filteredUser = {
                  id: user?._id || "",
                  online: user?.online || false,
                  rating: user?.basicInfo?.rating || "",
                  profilePic: user?.basicInfo?.profilePic || "",
                  displayName: user?.basicInfo?.displayName || "",
                  industry: user?.industryOccupation?.industry?.name || "",
                  occupation: user?.industryOccupation?.occupation?.name || "",
                  pricing: user?.pricing || {
                    _id: "",
                    _v: 0,
                    audioCallPrice: 0,
                    messagePrice: 0,
                    videoCallPrice: 0,
                  },
                };
                resolve(filteredUser);
              })
          )
        )
          .then((filteredData) => {
            resolve(filteredData);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};


// block 
module.exports.getAllBlockedUsers = function (userId) {
  return new Promise((resolve, reject) => {
    User.findById(userId)
      .populate("blockedUsers", "email phoneNo")
      .then((user) => {
        if (user) {
          resolve(user.blockedUsers);
        } else {
          resolve(null);
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};