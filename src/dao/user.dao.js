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
const OpenAI = require('openai');


module.exports.getUserDetailsById = function (id) {
  return new Promise((resolve, reject) => {
    user
      .findOne({ where: { id: id , isDeleted: false } })
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
    User.findOne({ _id: userId , isDeleted: false })
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
    User.findOne({ _id: userId , isDeleted: false })
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


module.exports.getIndustryOccupation = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId , isDeleted: false })
      .populate({
        path: "industryOccupation",
        populate: { path: "industry occupation" },
      })
      .populate("education")
      .populate("workExperience")
      .then((data) => {
        const flatData = {
          industry: data.industryOccupation?.industry?.name || null,
          occupation: data.industryOccupation?.occupation?.name || null,
          registrationNumber: data.industryOccupation?.registrationNumber || null,
          certificate: data.industryOccupation?.certificate || null,
          achievements: data.industryOccupation?.achievements || [],
          education: data.education || [],
          workExperience: data.workExperience || [],
        };
        resolve(flatData);
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
    User.findOne({ _id: userId , isDeleted: false })
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
    ExpertiseItemModel.find({isDeleted:false})
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
    User.findOne({ _id: userId , isDeleted: false })
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
    Education.findOne({ _id: id , isDeleted: false })
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
    Education.findOneAndDelete({_id:id , isDeleted: false})
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
    Availability.findOneAndDelete({_id:id , isDeleted: false})
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
    User.findOne({ _id: userId , isDeleted: false })
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
    WorkExperience.findOne({ _id: id , isDeleted: false })
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
    WorkExperience.findOneAndDelete({_id:id , isDeleted: false})
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
    About.findOne({ user: userId , isDeleted: false })
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
    User.findOne({ _id: userId , isDeleted: false })
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
    InterestItemsModel.find({isDeleted:false})
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
    LanguageItemsModel.find({isDeleted:false})
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
    User.findOne({ _id: userId , isDeleted: false })
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
    User.findOne({ _id: userId , isDeleted: false })
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
    User.findOne({ _id: userId , isDeleted: false })
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
    Availability.findOne({ _id: id , isDeleted: false })
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
    UserAccount.findOne({ user: userId , isDeleted: false })
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
    User.findOne({ _id: userId , isDeleted: false })
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
    Post.find({ user: userId , isDeleted: false })
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
    Feed.find({ user: userId , isDeleted: false })
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
    Policy.findOne({ user: userId , isDeleted: false })
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
    User.findOne({ _id: userId , isDeleted: false })
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
          const isFollowing = data.basicInfo.followers.some(
            (followerId) => followerId.toString() === ownUserId
          );

          // Add isFollowing field to the data object
          const result = data.toObject(); // Convert to a plain JavaScript object
          result.isFollowing = isFollowing;
          const ownUser = await User.findOne({ _id: ownUserId, isDeleted: false });
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
    User.find({isDeleted:false})
      .select(
        "_id online rating profilePic displayName industryOccupation pricing language expertise"
      )
      .populate({
        path: "industryOccupation",
        populate: [
          { path: "industry", select: "name" },
          { path: "occupation", select: "name" },
        ],
      })
      .populate("pricing")
      .populate("basicInfo").populate({
        path: "expertise",
        populate: { path: "expertise" },
      }).populate({
        path:"language",
        populate:{path:"language"}
      })
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
                  language:user?.language?.language,
                  expertise:user?.expertise?.expertise,
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

// module.exports.getUserBySearch = function (query) {
//   return new Promise(async (resolve, reject) => {
//     const aggregationPipeline = [
//       {
//         $lookup: {
//           from: "basicinfos",
//           localField: "basicInfo",
//           foreignField: "_id",
//           as: "basicInfo",
//         },
//       },
//       {
//         $lookup: {
//           from: "industryoccupations",
//           localField: "industryOccupation",
//           foreignField: "_id",
//           as: "industryOccupation",
//         },
//       },
//       {
//         $lookup: {
//           from: "industries",
//           localField: "industryOccupation.industry",
//           foreignField: "_id",
//           as: "industry",
//         },
//       },
//       {
//         $lookup: {
//           from: "occupations",
//           localField: "industryOccupation.occupation",
//           foreignField: "_id",
//           as: "occupation",
//         },
//       },
//       {
//         $lookup: {
//           from: "interests",
//           localField: "intereset",
//           foreignField: "_id",
//           as: "interest",
//         },
//       },
//       {
//         $lookup: {
//           from: "interestitems",
//           localField: "interest.intereset",
//           foreignField: "_id",
//           as: "interestItems",
//         },
//       },
//       {
//         $lookup: {
//           from: "languages",
//           localField: "language",
//           foreignField: "_id",
//           as: "language",
//         },
//       },
//       {
//         $lookup: {
//           from: "languageitems",
//           localField: "language.language",
//           foreignField: "_id",
//           as: "languageItems",
//         },
//       },
//       {
//         $lookup: {
//           from: "expertise",
//           localField: "expertise",
//           foreignField: "_id",
//           as: "expertise",
//         },
//       },
//       {
//         $lookup: {
//           from: "expertiseitems",
//           localField: "expertise.expertise",
//           foreignField: "_id",
//           as: "expertiseItems",
//         },
//       },
//       {
//         $lookup: {
//           from: "pricings",
//           localField: "pricing",
//           foreignField: "_id",
//           as: "pricing",
//         },
//       },
//       {
//         $match: query
//           ? {
//               $or: [
//                 { "basicInfo.firstName": { $regex: query, $options: "i" } },
//                 { "basicInfo.lastName": { $regex: query, $options: "i" } },
//                 { "basicInfo.displayName": { $regex: query, $options: "i" } },
//                 { "industry.name": { $regex: query, $options: "i" } },
//                 { "occupation.name": { $regex: query, $options: "i" } },
//                 { email: { $regex: query, $options: "i" } },
//                 { "interestItems.name": { $regex: query, $options: "i" } },
//                 { "languageItems.name": { $regex: query, $options: "i" } },
//                 { "expertiseItems.name": { $regex: query, $options: "i" } },
//               ],
//             }
//           : {},
//       },
//       {
//         $addFields: {
//           sortOrder: {
//             $cond: [{ $eq: ["$isVerified", true] }, 0, 1],
//           },
//           randomValue: { $rand: {} },
//         },
//       },
//       {
//         $sort: {
//           sortOrder: 1,
//           noOfBooking: -1,
//           randomValue: 1,
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           online: { $ifNull: ["$online", false] },
//           isVerified: { $ifNull: ["$isVerified", false] },
//           noOfBooking: { $ifNull: ["$noOfBooking", 0] },
//           rating: { $ifNull: [{ $arrayElemAt: ["$basicInfo.rating", 0] }, ""] },
//           profilePic: {
//             $ifNull: [{ $arrayElemAt: ["$basicInfo.profilePic", 0] }, ""],
//           },
//           displayName: {
//             $ifNull: [{ $arrayElemAt: ["$basicInfo.displayName", 0] }, ""],
//           },
//           lastName: {
//             $ifNull: [{ $arrayElemAt: ["$basicInfo.lastName", 0] }, ""],
//           },
//           firstName: {
//             $ifNull: [{ $arrayElemAt: ["$basicInfo.firstName", 0] }, ""],
//           },
//           industry: { $ifNull: [{ $arrayElemAt: ["$industry.name", 0] }, ""] },
//           occupation: {
//             $ifNull: [{ $arrayElemAt: ["$occupation.name", 0] }, ""],
//           },
//           language: { $ifNull: ["$languageItems", []] },
//           expertise: { $ifNull: ["$expertiseItems", []] },
//           pricing: {
//             $ifNull: [
//               { $arrayElemAt: ["$pricing", 0] },
//               {
//                 _id: "",
//                 _v: 0,
//                 audioCallPrice: 0,
//                 messagePrice: 0,
//                 videoCallPrice: 0,
//               },
//             ],
//           },
//         },
//       },
//     ];

//     await User.aggregate(aggregationPipeline)
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((err) => {
//         console.log(err);
//         reject(err);
//       });
//   });
// };

module.exports.getCategories = function (userId) {
  return new Promise((resolve, reject) => {
    Category.find({isDeleted:false})
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
    IndustryModel.find({isDeleted:false})
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
    OccupationModel.find({ industry: industryId , isDeleted: false })
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
      isDeleted: false,
    }).select("_id");
    const industryOccupationIds = industryOccupations.map((io) => io._id);
    User.find({ isDeleted:false , industryOccupation: { $in: industryOccupationIds } })
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
    User.findOne({_id:userId , isDeleted: false})
      .populate({
        path: "blockedUsers",
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
      })
      .then((data) => {
        console.log("filteredUser--> ", data);
        Promise.all(
          data?.blockedUsers?.map(
            (user) =>
              new Promise((resolve) => {
                const filteredUser = {
                  id: user?._id || "",
                  isVerified: user?.isVerified || "",
                  online: user?.online || false,
                  rating: user?.basicInfo?.rating || "",
                  profilePic: user?.basicInfo?.profilePic || "",
                  displayName: user?.basicInfo?.displayName || "",
                  industry: user?.industryOccupation?.industry?.name || "",
                  occupation: user?.industryOccupation?.occupation?.name || "",
                };
                console.log("filteredUser--> ", filteredUser);
                resolve(filteredUser);
              })
          )
        ).then((filteredData) => {
          resolve(filteredData);
        });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports.getProfileCompletion = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({_id:userId , isDeleted: false})
      .populate("basicInfo")
      .populate("education")
      .populate("industryOccupation")
      .populate("workExperience")
      .populate("intereset")
      .populate("language")
      .populate("expertise")
      .populate("pricing")
      .populate("availability")
      .then((user) => {
        if (user) {
          const completionDetails = user.calculateProfileCompletion();
          if (completionDetails) resolve(completionDetails);
          else resolve(null);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// exports.getUserBySearch = async function (query) {
//   try {
//     if (!query || typeof query !== 'string') {
//       return new Promise((resolve) => resolve([]));
//     }

//     // 1. Clean and normalize the query
//     const cleanedQuery = query.trim().toLowerCase();
    
//     // 2. Handle empty queries
//     if (cleanedQuery.length < 2) {
//       return new Promise((resolve) => resolve([]));
//     }

//     // 3. Use OpenAI to understand intent and extract relevant terms
//     const completion = await openai.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: `You are a professional search assistant. Your task is to:
//           1. Understand the user's intent, even with typos or misspellings
//           2. Extract the most relevant professional term(s). Can be single or multiple words if needed.
//           3. Return "none" if the query is completely irrelevant to professional skills
          
//           Return format: Return most relevant professional term(s) in lowercase
          
//           Examples:
//           "I need a docter for my hart" -> "heart specialist"
//           "looking for good develper" -> "developer"
//           "need physcian" -> "physician"
//           "wat is the time now" -> "none"
//           "asdfgh" -> "none"
//           "need someone who can teech math" -> "math teacher"
//           "marketing expert for my business" -> "digital marketing"
//           "someone to fix my carr" -> "car mechanic"
//           "i want pizza" -> "none"
//           "property lawyer" -> "real estate lawyer"
//           "website creation" -> "web developer"
//           "fix my computer" -> "computer technician"
//           "mobile app creation" -> "mobile app developer"
//           "home renovation" -> "interior designer"
//           "financial advice" -> "financial advisor"
//           "logo design needed" -> "graphic designer"
//           "need help with taxes" -> "tax consultant"
//           "photgrapher for event" -> "event photographer"
//           "social meda marketing" -> "social media manager"
//           "UI UX for my app" -> "ui ux designer"
//           "artificial intelligence expert" -> "ai specialist"
//           "data science project" -> "data scientist"
//           "full stack develoment" -> "full stack developer"
//           "cloud computing expert" -> "cloud architect"`
//         },
//         {
//           role: "user",
//           content: cleanedQuery
//         }
//       ],
//       model: "gpt-3.5-turbo",
//       max_tokens: 20,
//       temperature: 0.3,
//     });

//     let keyword = completion.choices[0].message.content.trim().toLowerCase();
    
//     // 4. Handle invalid or irrelevant responses
//     if (keyword === 'none' || keyword.length < 2) {
//       return [];
//     }

//     // 5. Split keyword into terms for more flexible matching
//     const searchTerms = keyword.split(' ').filter(term => term.length > 2);

//     // 6. Build search aggregation pipeline
//     const aggregationPipeline = [
//       {
//         $lookup: {
//           from: "basicinfos",
//           localField: "basicInfo",
//           foreignField: "_id",
//           as: "basicInfo",
//         },
//       },
//       {
//         $lookup: {
//           from: "industryoccupations",
//           localField: "industryOccupation",
//           foreignField: "_id",
//           as: "industryOccupation",
//         },
//       },
//       {
//         $lookup: {
//           from: "industries",
//           localField: "industryOccupation.industry",
//           foreignField: "_id",
//           as: "industry",
//         },
//       },
//       {
//         $lookup: {
//           from: "occupations",
//           localField: "industryOccupation.occupation",
//           foreignField: "_id",
//           as: "occupation",
//         },
//       },
//       {
//         $lookup: {
//           from: "expertise",
//           localField: "expertise",
//           foreignField: "_id",
//           as: "expertiseList",
//         },
//       },
//       {
//         $lookup: {
//           from: "expertiseitems",
//           localField: "expertiseList.expertise",
//           foreignField: "_id",
//           as: "expertiseItems",
//         },
//       },
//       {
//         $match: {
//           $or: [
//             // Match all terms in various fields
//             ...searchTerms.map(term => ({
//               $or: [
//                 { "industry.name": { $regex: term, $options: "i" } },
//                 { "occupation.name": { $regex: term, $options: "i" } },
//                 { "expertiseItems.name": { $regex: term, $options: "i" } },
//                 { "basicInfo.bio": { $regex: term, $options: "i" } },
//               ]
//             })),
//             // Also try to match the complete phrase
//             { "industry.name": { $regex: keyword, $options: "i" } },
//             { "occupation.name": { $regex: keyword, $options: "i" } },
//             { "expertiseItems.name": { $regex: keyword, $options: "i" } },
//             { "basicInfo.bio": { $regex: keyword, $options: "i" } },
//           ],
//         },
//       },
//       {
//         $addFields: {
//           matchScore: {
//             $add: [
//               // Full phrase match bonus
//               {
//                 $cond: [
//                   { 
//                     $or: [
//                       { $regexMatch: { input: { $toLower: "$occupation.name" }, regex: keyword, options: "i" } },
//                       { $regexMatch: { input: { $toLower: "$industry.name" }, regex: keyword, options: "i" } }
//                     ]
//                   },
//                   10,
//                   0
//                 ]
//               },
//               // Term match bonuses
//               {
//                 $sum: searchTerms.map(term => ({
//                   $cond: [
//                     {
//                       $or: [
//                         { $regexMatch: { input: { $toLower: "$occupation.name" }, regex: term, options: "i" } },
//                         { $regexMatch: { input: { $toLower: "$industry.name" }, regex: term, options: "i" } }
//                       ]
//                     },
//                     3,
//                     0
//                   ]
//                 }))
//               },
//               // Verification bonus
//               { $cond: [{ $eq: ["$isVerified", true] }, 3, 0] },
//               // Booking history bonus
//               { $cond: [{ $gt: ["$noOfBooking", 0] }, 2, 0] },
//               // Rating bonus
//               { $cond: [{ $gt: [{ $arrayElemAt: ["$basicInfo.rating", 0] }, 4] }, 2, 0] },
//               { $cond: [{ $gt: [{ $arrayElemAt: ["$basicInfo.rating", 0] }, 3] }, 1, 0] }
//             ]
//           },
//           randomScore: { $rand: {} }
//         }
//       },
//       {
//         $sort: {
//           matchScore: -1,
//           randomScore: 1
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           online: { $ifNull: ["$online", false] },
//           isVerified: { $ifNull: ["$isVerified", false] },
//           noOfBooking: { $ifNull: ["$noOfBooking", 0] },
//           rating: { $ifNull: [{ $arrayElemAt: ["$basicInfo.rating", 0] }, ""] },
//           profilePic: {
//             $ifNull: [{ $arrayElemAt: ["$basicInfo.profilePic", 0] }, ""],
//           },
//           displayName: {
//             $ifNull: [{ $arrayElemAt: ["$basicInfo.displayName", 0] }, ""],
//           },
//           firstName: {
//             $ifNull: [{ $arrayElemAt: ["$basicInfo.firstName", 0] }, ""],
//           },
//           lastName: {
//             $ifNull: [{ $arrayElemAt: ["$basicInfo.lastName", 0] }, ""],
//           },
//           industry: { $ifNull: [{ $arrayElemAt: ["$industry.name", 0] }, ""] },
//           occupation: {
//             $ifNull: [{ $arrayElemAt: ["$occupation.name", 0] }, ""],
//           },
//           expertise: "$expertiseItems.name",
//           matchScore: 1,
//           searchMetadata: {
//             originalQuery: query,
//             extractedTerms: keyword,
//             matchedTerms: searchTerms
//           }
//         },
//       },
//       {
//         $limit: 20
//       }
//     ];

//     const User = mongoose.model('User');
//     const results = await User.aggregate(aggregationPipeline);

//     if (process.env.NODE_ENV === 'development') {
//       console.log({
//         originalQuery: query,
//         extractedTerms: keyword,
//         matchedTerms: searchTerms,
//         resultsFound: results.length,
//       });
//     }

//     return results;

//   } catch (error) {
//     console.error("Error in getUserBySearch:", error);
//     return [];
//   }
// };




exports.getUserBySearch = async function (query) {
  try {
    console.log("search--> ",query);
    if (!query || typeof query !== 'string') {
      return new Promise((resolve) => resolve([]));
    }

    const cleanedQuery = query.trim();
    
    if (cleanedQuery.length < 2) {
      return [];
    }

    // Get search context from OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a search assistant for a professional networking platform. Analyze the query and:
          1. If it's a name search, return "name: {query}"
          2. If it's a language search, return "language: {language}"
          3. For professional searches:
             - Understand the core profession/skill being sought
             - Handle any variation in how it's described
             - Return standardized professional term(s)
          
          Examples:
          // Names
          "John Smith" -> "name: John Smith"
          "Dr. Williams" -> "name: Williams"
          
          // Healthcare
          "heart doctor" -> "cardiologist"
          "doctor for kids" -> "pediatrician"
          "skin doctor" -> "dermatologist"
          
          // Technology
          "can make websites" -> "web developer"
          "phone app creator" -> "mobile app developer"
          "AI person" -> "ai engineer"
          "computer fixer" -> "computer technician"
          
          // Creative
          "logo making" -> "graphic designer"
          "photo taking" -> "photographer"
          "video editing" -> "video editor"
          
          // Finance/Business
          "money advisor" -> "financial advisor"
          "tax help" -> "tax consultant"
          "business help" -> "business consultant"
          
          // Education
          "math teaching" -> "math teacher"
          "english lessons" -> "english tutor"
          
          // Trades
          "house fixing" -> "handyman"
          "car repair" -> "mechanic"
          "electricity work" -> "electrician"
          
          // Languages
          "spanish speaking" -> "language: spanish"
          "french teacher" -> "french instructor"
          
          // General Patterns
          "need someone for {X}" -> "{relevant profession}"
          "looking for {X}" -> "{relevant profession}"
          "want help with {X}" -> "{relevant profession}"
          "specialist of {X}" -> "{relevant profession}"
          "expert in {X}" -> "{relevant profession}"`
        },
        {
          role: "user",
          content: cleanedQuery
        }
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 30,
      temperature: 0.3,
    });

    let searchQuery = completion.choices[0].message.content.trim().toLowerCase();
    let isNameSearch = searchQuery.startsWith("name:");
    let isLanguageSearch = searchQuery.startsWith("language:");

    // Extract actual search terms
    if (isNameSearch) {
      searchQuery = searchQuery.substring(5).trim();
    } else if (isLanguageSearch) {
      searchQuery = searchQuery.substring(9).trim();
    }

    // Split search terms for better matching
    const searchTerms = searchQuery.split(' ').filter(term => term.length > 2);

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
        $lookup: {
          from: "languages",
          localField: "language",
          foreignField: "_id",
          as: "language",
        },
      },
      {
        $lookup: {
          from: "languageitems",
          localField: "language.language",
          foreignField: "_id",
          as: "languageItems",
        },
      },
      {
        $lookup: {
          from: "expertise",
          localField: "expertise",
          foreignField: "_id",
          as: "expertise",
        },
      },
      {
        $lookup: {
          from: "expertiseitems",
          localField: "expertise.expertise",
          foreignField: "_id",
          as: "expertiseItems",
        },
      },
      {
        $lookup: {
          from: "pricings",
          localField: "pricing",
          foreignField: "_id",
          as: "pricing",
        },
      },
      {
        $match: {
          $or: isNameSearch ? 
          [
            { "basicInfo.firstName": { $regex: searchQuery, $options: "i" } },
            { "basicInfo.lastName": { $regex: searchQuery, $options: "i" } },
            { "basicInfo.displayName": { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
          ] : 
          isLanguageSearch ?
          [
            { "languageItems.name": { $regex: searchQuery, $options: "i" } },
          ] :
          [
            // Full phrase matching
            { "industry.name": { $regex: searchQuery, $options: "i" } },
            { "occupation.name": { $regex: searchQuery, $options: "i" } },
            { "expertiseItems.name": { $regex: searchQuery, $options: "i" } },
            { "interestItems.name": { $regex: searchQuery, $options: "i" } },
            // Individual terms matching for each field
            ...searchTerms.flatMap(term => [
              { "industry.name": { $regex: term, $options: "i" } },
              { "occupation.name": { $regex: term, $options: "i" } },
              { "expertiseItems.name": { $regex: term, $options: "i" } },
              { "interestItems.name": { $regex: term, $options: "i" } },
              { "basicInfo.bio": { $regex: term, $options: "i" } },
            ]),
          ],
        },
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              // Exact match bonus
              {
                $cond: [
                  { 
                    $or: [
                      { $regexMatch: { input: { $toLower: "$occupation.name" }, regex: searchQuery, options: "i" } },
                      { $regexMatch: { input: { $toLower: "$expertiseItems.name" }, regex: searchQuery, options: "i" } },
                      { $regexMatch: { input: { $toLower: "$industry.name" }, regex: searchQuery, options: "i" } }
                    ]
                  },
                  5,
                  0
                ]
              },
              // Verification bonus
              { $cond: [{ $eq: ["$isVerified", true] }, 3, 0] },
              // Booking history bonus
              { $cond: [{ $gt: ["$noOfBooking", 0] }, 2, 0] },
              // Rating bonus
              { $cond: [{ $gt: [{ $arrayElemAt: ["$basicInfo.rating", 0] }, 4] }, 2, 0] },
              { $cond: [{ $gt: [{ $arrayElemAt: ["$basicInfo.rating", 0] }, 3] }, 1, 0] }
            ]
          },
          randomScore: { $rand: {} }
        }
      },
      {
        $sort: {
          matchScore: -1,
          noOfBooking: -1,
          randomScore: 1
        }
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
          language: { $ifNull: ["$languageItems", []] },
          expertise: { $ifNull: ["$expertiseItems", []] },
          pricing: {
            $ifNull: [
              { $arrayElemAt: ["$pricing", 0] },
              {
                _id: "",
                _v: 0,
                audioCallPrice: 0,
                messagePrice: 0,
                videoCallPrice: 0,
              },
            ],
          },
          searchMetadata: {
            originalQuery: query,
            processedQuery: searchQuery,
            searchTerms,
            searchType: isNameSearch ? "name" : isLanguageSearch ? "language" : "professional"
          }
        },
      },
    ];

    const results = await User.aggregate(aggregationPipeline);

    // Log search analytics in development
    if (process.env.NODE_ENV === 'development') {
      console.log({
        originalQuery: query,
        processedQuery: searchQuery,
        searchTerms,
        searchType: isNameSearch ? "name" : isLanguageSearch ? "language" : "professional",
        resultsFound: results.length,
      });
    }

     console.log("results--> ",results);
    return results;

  } catch (error) {
    console.error("Error in getUserBySearch:", error);
    return performBasicSearch(query);
  }
};


async function  performBasicSearch (query) {
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
        $lookup: {
          from: "languages",
          localField: "language",
          foreignField: "_id",
          as: "language",
        },
      },
      {
        $lookup: {
          from: "languageitems",
          localField: "language.language",
          foreignField: "_id",
          as: "languageItems",
        },
      },
      {
        $lookup: {
          from: "expertise",
          localField: "expertise",
          foreignField: "_id",
          as: "expertise",
        },
      },
      {
        $lookup: {
          from: "expertiseitems",
          localField: "expertise.expertise",
          foreignField: "_id",
          as: "expertiseItems",
        },
      },
      {
        $lookup: {
          from: "pricings",
          localField: "pricing",
          foreignField: "_id",
          as: "pricing",
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
                { "languageItems.name": { $regex: query, $options: "i" } },
                { "expertiseItems.name": { $regex: query, $options: "i" } },
              ],
            }
          : {},
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
          language: { $ifNull: ["$languageItems", []] },
          expertise: { $ifNull: ["$expertiseItems", []] },
          pricing: {
            $ifNull: [
              { $arrayElemAt: ["$pricing", 0] },
              {
                _id: "",
                _v: 0,
                audioCallPrice: 0,
                messagePrice: 0,
                videoCallPrice: 0,
              },
            ],
          },
        },
      },
    ];

    await User.aggregate(aggregationPipeline)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
        console.error("Error in fallback search:", error);
         return [];
      });
  });
};



exports.generateBioSuggestions = async (userInput)=> {
  try {
    const prompt = `Based on this description: "${userInput}", generate 4 unique, professional, and engaging bio suggestions. Each bio should be 2-3 sentences long and expand upon the given input while maintaining professionalism and personality. Format as JSON array of strings. Don't include quotation marks or numbers in the bios themselves.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional bio writer who creates engaging and professional bios that capture the essence of a person's professional identity.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = JSON.parse(completion.data.choices[0].message.content);
    return response;
  } catch (error) {
    console.error("Error generating bio suggestions:", error);
    throw error;
  }
}
