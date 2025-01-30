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
const Review=require("../models/review.model");
const Booking=require("../models/booking.model");
const Message=require("../models/message.model");
const Chat=require("../models/chat.model");
const Device=require("../models/device.model");
const Notification=require("../models/notification.model");
const KYC=require("../models/kyc.model");
const BlockedUser=require("../models/blockUser.model");

module.exports.getUserDetailsById = function (id) {
  return new Promise((resolve, reject) => {
    User
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
  let userData = await User.findOne({_id:id,isDeleted:false});
  if (null != userData) {
    return userData.email;
  } else {
    return userData;
  }
};

module.exports.getUserById = async function (id) {
  let userData = await User.findOne({_id:id,isDeleted:false});
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
    User.findOne({ _id: userId, isDeleted: false })
      .populate({
        path: "industryOccupation",
        populate: [
          {
            path: "level1Service",
            select: "name _id"
          },
          {
            path: "level2Service",
            select: "name _id"
          },
          {
            path: "level3Services",
            select: "name _id"
          }
        ]
      })
      .populate("education")
      .populate("workExperience")
      .then((data) => {
        const flatData = {
          level1: data.industryOccupation?.level1Service
          ? { _id: data.industryOccupation.level1Service._id, name: data.industryOccupation.level1Service.name }
          : null,
        level2: data.industryOccupation?.level2Service
          ? { _id: data.industryOccupation.level2Service._id, name: data.industryOccupation.level2Service.name }
          : null,
        level3: data.industryOccupation?.level3Services?.map(service => ({
          _id: service._id,
          name: service.name
        })) || [], registrationNumber: data.industryOccupation?.registrationNumber || null,
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


module.exports.followersandfollowing = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId, isDeleted: false })
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
              populate: [
                { path: "level1Service", select: "name" },
                { path: "level2Service", select: "name" },
                { path: "level3Services", select: "name" }
              ]
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
                  level1: user?.industryOccupation?.level1Service?.name || "",
                  level2: user?.industryOccupation?.level2Service?.name || "",
                  level3: user?.industryOccupation?.level3Services?.map(service => service.name) || []
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
                      level1: user?.industryOccupation?.level1Service?.name || "",
                      level2: user?.industryOccupation?.level2Service?.name || "",
                      level3: user?.industryOccupation?.level3Services?.map(service => service.name) || []
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
    User.findOne({ _id: userId, isDeleted: false })
      .populate("education")
      .populate({
        path: "industryOccupation",
        populate: [
          { path: "level1Service", select: "name" },
          { path: "level2Service", select: "name" },
          { path: "level3Services", select: "name" }
        ]
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
      .populate({
        path: "expertise",
        populate: { path: "expertise" },
      })
      .populate("pricing")
      .then(async (data) => {
        if (data && data.basicInfo) {
          const isFollowing = data.basicInfo.followers.some(
            (followerId) => followerId.toString() === ownUserId
          );
 
          const result = data.toObject();
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
 
 module.exports.getTrending = function (userId) {
  return new Promise((resolve, reject) => {
    User.find({ isDeleted: false, _id: { $ne: userId } })
      .select(
        "_id online rating profilePic displayName industryOccupation pricing language expertise noOfBooking"
      )
      .populate({
        path: "industryOccupation",
        populate: [
          { path: "level1Service", select: "name" },
          { path: "level2Service", select: "name" },
          { path: "level3Services", select: "name" }
        ]
      })
      .populate("pricing")
      .populate("basicInfo")
      .populate({
        path: "expertise",
        populate: { path: "expertise" }
      })
      .populate({
        path: "language",
        populate: {path: "language"}
      })
      .sort({ noOfBooking: -1 })
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
                  level1: user?.industryOccupation?.level1Service?.name || "",
                  level2: user?.industryOccupation?.level2Service?.name || "",
                  level3: user?.industryOccupation?.level3Services?.map(service => service.name) || [],
                  language: user?.language?.language,
                  expertise: user?.expertise?.expertise,
                  pricing: user?.pricing || {
                    _id: "",
                    _v: 0,
                    audioCallPrice: 0,
                    messagePrice: 0,
                    videoCallPrice: 0,
                  },
                  noOfBooking: user?.noOfBooking || 0,
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

module.exports.getUserByIndustry = function (level1ServiceId) {
  return new Promise(async (resolve, reject) => {
    // Find all industry occupations that have this level1Service
    const industryOccupations = await IndustryOccupation.find({
      level1Service: level1ServiceId,
      isDeleted: false,
    }).select("_id");
 
    const industryOccupationIds = industryOccupations.map((io) => io._id);
 
    User.find({ isDeleted:false, industryOccupation: { $in: industryOccupationIds } })
      .select(
        "_id online rating profilePic displayName industryOccupation pricing"  
      )
      .populate({
        path: "industryOccupation",
        populate: [
          { path: "level1Service", select: "name" },
          { path: "level2Service", select: "name" },
          { path: "level3Services", select: "name" }
        ]
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
                  level1: user?.industryOccupation?.level1Service?.name || "",
                  level2: user?.industryOccupation?.level2Service?.name || "",
                  level3: user?.industryOccupation?.level3Services?.map(service => service.name) || [],
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



exports.getUserBySearch = async function (query) {
  try {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const cleanedQuery = query.trim();
    
    if (cleanedQuery.length < 2) {
      return [];
    }

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
             - Return standardized professional term(s)`
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

    if (isNameSearch) {
      searchQuery = searchQuery.substring(5).trim();
    } else if (isLanguageSearch) {
      searchQuery = searchQuery.substring(9).trim();
    }

    const searchTerms = searchQuery.split(' ').filter(term => term.length > 2);

    const aggregationPipeline = [
      {
        $match: { isDeleted: { $ne: true } }
      },
      {
        $lookup: {
          from: "basicinfos",
          localField: "basicInfo",
          foreignField: "_id",
          as: "basicInfoData"
        }
      },
      {
        $lookup: {
          from: "industryoccupations",
          localField: "industryOccupation",
          foreignField: "_id",
          as: "industryOccupationData"
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "industryOccupationData.level1Service",
          foreignField: "_id",
          as: "level1Services"
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "industryOccupationData.level2Service",
          foreignField: "_id",
          as: "level2Services"
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "industryOccupationData.level3Services",
          foreignField: "_id",
          as: "level3Services"
        }
      },
      {
        $lookup: {
          from: "languages",
          localField: "language",
          foreignField: "_id",
          as: "languageData"
        }
      },
      {
        $lookup: {
          from: "languageitems",
          localField: "languageData.language",
          foreignField: "_id",
          as: "languageItems"
        }
      },
      {
        $lookup: {
          from: "pricings",
          localField: "pricing",
          foreignField: "_id",
          as: "pricingData"
        }
      },
      {
        $match: {
          $or: isNameSearch ? 
          [
            { "basicInfoData.firstName": { $regex: searchQuery, $options: "i" } },
            { "basicInfoData.lastName": { $regex: searchQuery, $options: "i" } },
            { "basicInfoData.displayName": { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } }
          ] : 
          isLanguageSearch ?
          [
            { "languageItems.name": { $regex: searchQuery, $options: "i" } }
          ] :
          [
            { "level1Services.name": { $regex: searchQuery, $options: "i" } },
            { "level2Services.name": { $regex: searchQuery, $options: "i" } },
            { "level3Services.name": { $regex: searchQuery, $options: "i" } },
            { "basicInfoData.bio": { $regex: searchQuery, $options: "i" } },
            ...searchTerms.map(term => ({
              $or: [
                { "level1Services.name": { $regex: term, $options: "i" } },
                { "level2Services.name": { $regex: term, $options: "i" } },
                { "level3Services.name": { $regex: term, $options: "i" } },
                { "basicInfoData.bio": { $regex: term, $options: "i" } }
              ]
            }))
          ]
        }
      },
      {
        $project: {
          _id: 1,
          online: { $ifNull: ["$online", false] },
          isVerified: { $ifNull: ["$isVerified", false] },
          noOfBooking: { $ifNull: ["$noOfBooking", 0] },
          basicInfo: { $arrayElemAt: ["$basicInfoData", 0] },
          level1: { $arrayElemAt: ["$level1Services", 0] },
          level2: { $arrayElemAt: ["$level2Services", 0] },
          level3: "$level3Services",
          languageItems: 1,
          pricing: { $arrayElemAt: ["$pricingData", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          online: 1,
          isVerified: 1,
          noOfBooking: 1,
          rating: { $ifNull: ["$basicInfo.rating", 0] },
          profilePic: { $ifNull: ["$basicInfo.profilePic", ""] },
          displayName: { $ifNull: ["$basicInfo.displayName", ""] },
          firstName: { $ifNull: ["$basicInfo.firstName", ""] },
          lastName: { $ifNull: ["$basicInfo.lastName", ""] },
          level1: { $ifNull: ["$level1.name", ""] },
          level2: { $ifNull: ["$level2.name", ""] },
          level3: { $ifNull: ["$level3.name", []] },
          languageItems: 1,
          pricing: {
            $ifNull: ["$pricing", {
              audioCallPrice: 0,
              videoCallPrice: 0,
              messagePrice: 0
            }]
          }
        }
      },
      {
        $sort: {
          isVerified: -1,
          noOfBooking: -1,
          rating: -1
        }
      },
      {
        $limit: 20
      }
    ];

    const results = await User.aggregate(aggregationPipeline);

    if (process.env.NODE_ENV === 'development') {
      console.log({
        originalQuery: query,
        processedQuery: searchQuery,
        searchTerms,
        searchType: isNameSearch ? "name" : isLanguageSearch ? "language" : "professional",
        resultsFound: results.length
      });
    }

    return results;

  } catch (error) {
    console.error("Error in getUserBySearch:", error);
    return performBasicSearch(query);
  }
};

async function performBasicSearch(query) {
  try {
    return await User.aggregate([
      {
        $match: { isDeleted: { $ne: true } }
      },
      {
        $lookup: {
          from: "basicinfos", 
          localField: "basicInfo",
          foreignField: "_id",
          as: "basicInfoData"
        }
      },
      {
        $lookup: {
          from: "industryoccupations",
          localField: "industryOccupation", 
          foreignField: "_id",
          as: "industryOccupationData"
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "industryOccupationData.level1Service",
          foreignField: "_id",
          as: "level1Service"
        }
      },
      {
        $lookup: {
          from: "services", 
          localField: "industryOccupationData.level2Service",
          foreignField: "_id",
          as: "level2Service"
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "industryOccupationData.level3Services",
          foreignField: "_id",
          as: "level3Services"
        }
      },
      {
        $match: {
          $or: [
            { "basicInfoData.firstName": { $regex: query, $options: "i" } },
            { "basicInfoData.lastName": { $regex: query, $options: "i" } },
            { "basicInfoData.displayName": { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          online: { $ifNull: ["$online", false] },
          isVerified: { $ifNull: ["$isVerified", false] },
          noOfBooking: { $ifNull: ["$noOfBooking", 0] },
          basicInfo: { $arrayElemAt: ["$basicInfoData", 0] },
          level1: { $arrayElemAt: ["$level1Service", 0] },
          level2: { $arrayElemAt: ["$level2Service", 0] },
          level3: "$level3Services"
        }
      },
      {
        $project: {
          _id: 1,
          online: 1, 
          isVerified: 1,
          noOfBooking: 1,
          rating: { $ifNull: ["$basicInfo.rating", 0] },
          profilePic: { $ifNull: ["$basicInfo.profilePic", ""] },
          displayName: { $ifNull: ["$basicInfo.displayName", ""] },
          firstName: { $ifNull: ["$basicInfo.firstName", ""] },
          lastName: { $ifNull: ["$basicInfo.lastName", ""] },
          level1: { $ifNull: ["$level1.name", ""] },
          level2: { $ifNull: ["$level2.name", ""] },
          level3: { $ifNull: ["$level3.name", []] }
        }
      },
      {
        $limit: 20
      }
    ]);
  } catch (error) {
    console.error("Error in basic search:", error);
    return [];
  }
 }

exports.getUserDetailsForAvailability = function(userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId, isDeleted: false })
      .populate('basicInfo')
      .then(user => {
        if (!user || !user.basicInfo) {
          resolve(null);
          return;
        }

        resolve({
          email: user.email,
          phoneNo: user.phoneNo,
          username: user.basicInfo.displayName
        });
      })
      .catch(err => {
        console.error("Error in getUserDetailsForAvailability:", err);
        reject(err);
      });
  });
};

exports.checkFieldsAvailabilityForOtherUsers = function(userId, email, phoneNo, username) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = {
        emailExists: false,
        phoneExists: false,
        usernameExists: false
      };

      const [emailCheck, phoneCheck] = await Promise.all([
        email ? User.findOne({ 
          email, 
          _id: { $ne: userId }, 
          isDeleted: false 
        }) : null,
        phoneNo ? User.findOne({ 
          phoneNo, 
          _id: { $ne: userId }, 
          isDeleted: false 
        }) : null
      ]);

      console.log("phoneCheck--> ",phoneCheck,emailCheck);

      if (username) {
        const usernameCheck = await User.findOne({ 
          _id: { $ne: userId }, 
          isDeleted: false 
        }).populate({
          path: 'basicInfo',
          match: { 
            displayName: username,
            isDeleted: false 
          }
        });

        result.usernameExists = usernameCheck && usernameCheck.basicInfo;
      }

      result.emailExists = !!emailCheck;
      result.phoneExists = !!phoneCheck;

      resolve(result);
    } catch (error) {
      console.error("Error in checkFieldsAvailabilityForOtherUsers:", error);
      reject(error);
    }
  });
};

exports.checkUsernameExistsForOtherUser = function(userId, username) {
  return new Promise((resolve, reject) => {
    User.findOne({
      _id: { $ne: userId },
      isDeleted: false
    }).populate({
      path: 'basicInfo',
      match: { 
        displayName: username,
        isDeleted: false 
      }
    })
    .then(user => {
      resolve(user && user.basicInfo);
    })
    .catch(err => {
      console.error("Error in checkUsernameExistsForOtherUser:", err);
      reject(err);
    });
  });
};

exports.updateUsername = function(userId, newUsername) {
  return new Promise((resolve, reject) => {
    User.findOne({ 
      _id: userId, 
      isDeleted: false 
    })
    .populate('basicInfo')
    .then(async user => {
      if (!user || !user.basicInfo) {
        reject(new Error("User or BasicInfo not found"));
        return;
      }

      const basicInfo = await BasicInfo.findByIdAndUpdate(
        user.basicInfo._id,
        { 
          $set: { 
            displayName: newUsername 
          } 
        },
        { new: true }
      );

      resolve(basicInfo);
    })
    .catch(err => {
      console.error("Error in updateUsername:", err);
      reject(err);
    });
  });
};

exports.generateBioSuggestions = async function(userInput) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Generate 4 unique professional bios based on the user's input. Guidelines:
          - Maximum 150 characters each
          - Focus on expertise, value proposition, and industry relevance
          - Maintain a professional tone
          - Include key skills and accomplishments where relevant
          - Make them engaging and unique
          - Optimize for profile discovery`
        },
        {
          role: "user",
          content: userInput
        }
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 400,
      temperature: 0.7
    });

    const suggestions = completion.choices[0].message.content
      .split('\n')
      .filter(line => line.trim())
      .map(bio => bio.replace(/^\d+\.\s+/, '').trim())
      .slice(0, 4);

    if (!suggestions.length) {
      return [
        "Experienced professional delivering innovative solutions and driving measurable results",
        "Expert focused on excellence and client success across multiple domains",
        "Results-driven specialist with proven expertise in development and problem-solving",
        "Dedicated professional passionate about creating impactful solutions"
      ];
    }

    return suggestions;

  } catch (error) {
    console.error("Error generating bio suggestions:", error);
    throw error;
  }
};

exports.deleteAccount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.body.user._id;
    
    const user = await User.findOne({ _id: userId, isDeleted: false }).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found"
      }));
    }

    await userDao.deleteUserAndAssociatedData(userId, user, session);
    await session.commitTransaction();

    res.json(createResponse.success({ message: "Account deleted successfully" }));
  } catch (error) {
    await session.abortTransaction();
    console.error("Delete account error:", error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE, 
      errorMessage: error.message
    }));
  } finally {
    session.endSession();
  }
};

exports.deleteUserAndAssociatedData = async (userId, user, session) => {
  try {
    // All queries must use the same session
    const updatePromises = [
      User.findOneAndUpdate(
        { _id: userId }, 
        { isDeleted: true }, 
        { session }
      ),
      BasicInfo.findOneAndUpdate(
        { _id: user.basicInfo }, 
        { isDeleted: true }, 
        { session }
      ),
      IndustryOccupation.findOneAndUpdate(
        { _id: user.industryOccupation }, 
        { isDeleted: true }, 
        { session }
      ),
      Education.updateMany(
        { _id: { $in: user.education } }, 
        { isDeleted: true }, 
        { session }
      ),
      WorkExperience.updateMany(
        { _id: { $in: user.workExperience } }, 
        { isDeleted: true }, 
        { session }
      ),
      Interest.findOneAndUpdate(
        { _id: user.intereset }, 
        { isDeleted: true }, 
        { session }
      ),
      Languages.findOneAndUpdate(
        { _id: user.language }, 
        { isDeleted: true }, 
        { session }
      ),
      Expertise.findOneAndUpdate(
        { _id: user.expertise }, 
        { isDeleted: true }, 
        { session }
      ),
      Pricing.findOneAndUpdate(
        { _id: user.pricing }, 
        { isDeleted: true }, 
        { session }
      ),
      Availability.updateMany(
        { _id: { $in: user.availability } }, 
        { isDeleted: true }, 
        { session }
      ),
      Post.updateMany(
        { postedBy: userId }, 
        { isDeleted: true }, 
        { session }
      ),
      Review.updateMany(
        { reviewBy: userId }, 
        { isDeleted: true }, 
        { session }
      ),
      Booking.updateMany(
        { $or: [{ expert: userId }, { client: userId }] }, 
        { isDeleted: true }, 
        { session }
      ),
      Message.updateMany(
        { sender: userId }, 
        { isDeleted: true }, 
        { session }
      ),
      Chat.updateMany(
        { users: userId }, 
        { isDeleted: true }, 
        { session }
      ),
      Device.updateMany(
        { user: userId }, 
        { isDeleted: true }, 
        { session }
      ),
      Notification.updateMany(
        { $or: [{ recipient: userId }, { sender: userId }] }, 
        { isDeleted: true }, 
        { session }
      ),
      KYC.findOneAndUpdate(
        { userId }, 
        { isDeleted: true }, 
        { session }
      ),
      UserAccount.findOneAndUpdate(
        { user: userId }, 
        { isDeleted: true }, 
        { session }
      ),
      BlockedUser.findOneAndUpdate(
        { _id: user.block }, 
        { isDeleted: true }, 
        { session }
      ),
    ];

    await Promise.all(updatePromises);
  } catch (error) {
    throw error; // Let the controller handle the error
  }
};

exports.restoreAccount = async function(user, session) {
  user = await user.save({ session });

  // Restore ALL associated data - matching every model from deletion
  const reactivationPromises = [
    // Core user data
    BasicInfo.findOneAndUpdate(
      { _id: user.basicInfo }, 
      { isDeleted: false }, 
      { session }
    ),
    BlockedUser.findOneAndUpdate(
      { _id: user.block }, 
      { isDeleted: false }, 
      { session }
    ),
    IndustryOccupation.findOneAndUpdate(
      { _id: user.industryOccupation }, 
      { isDeleted: false }, 
      { session }
    ),

    // Arrays of references
    Education.updateMany(
      { _id: { $in: user.education } }, 
      { isDeleted: false }, 
      { session }
    ),
    WorkExperience.updateMany(
      { _id: { $in: user.workExperience } }, 
      { isDeleted: false }, 
      { session }
    ),
    
    // Single references
    Interest.findOneAndUpdate(
      { _id: user.intereset }, 
      { isDeleted: false }, 
      { session }
    ),
    Languages.findOneAndUpdate(
      { _id: user.language }, 
      { isDeleted: false }, 
      { session }
    ),
    Expertise.findOneAndUpdate(
      { _id: user.expertise }, 
      { isDeleted: false }, 
      { session }
    ),
    Pricing.findOneAndUpdate(
      { _id: user.pricing }, 
      { isDeleted: false }, 
      { session }
    ),
    
    // Arrays of references
    Availability.updateMany(
      { _id: { $in: user.availability } }, 
      { isDeleted: false }, 
      { session }
    ),

    // Related content where user is referenced
    Post.updateMany(
      { postedBy: user._id }, 
      { isDeleted: false }, 
      { session }
    ),
    Review.updateMany(
      { reviewBy: user._id }, 
      { isDeleted: false }, 
      { session }
    ),
    Booking.updateMany(
      { $or: [{ expert: user._id }, { client: user._id }] },
      { isDeleted: false },
      { session }
    ),
    Message.updateMany(
      { sender: user._id }, 
      { isDeleted: false }, 
      { session }
    ),
    Chat.updateMany(
      { users: user._id }, 
      { isDeleted: false }, 
      { session }
    ),
    Device.updateMany(
      { user: user._id }, 
      { isDeleted: false }, 
      { session }
    ),
    Notification.updateMany(
      { $or: [{ recipient: user._id }, { sender: user._id }] },
      { isDeleted: false },
      { session }
    ),
    
    // User-specific documents
    KYC.findOneAndUpdate(
      { userId: user._id }, 
      { isDeleted: false }, 
      { session }
    ),
    UserAccount.findOneAndUpdate(
      { user: user._id }, 
      { isDeleted: false }, 
      { session }
    )
  ];

  await Promise.all(reactivationPromises);
  return user;
};

exports.getUserByServiceLevel = function (serviceId, level) {
  return new Promise(async (resolve, reject) => {
    try {
      // Build match condition based on service level
      let industryOccupationMatch = {};
      switch(level) {
        case 1:
          industryOccupationMatch = {
            level1Service: new mongoose.Types.ObjectId(serviceId)
          };
          break;
        case 2:
          industryOccupationMatch = {
            level2Service: new mongoose.Types.ObjectId(serviceId)
          };
          break;
        case 3:
          industryOccupationMatch = {
            level3Services: {
              $in: [new mongoose.Types.ObjectId(serviceId)]
            }
          };
          break;
        default:
          throw new Error("Invalid service level");
      }

      // Find all industry occupations matching the service level
      const industryOccupations = await IndustryOccupation.find({
        ...industryOccupationMatch,
        isDeleted: false
      }).select("_id");

      const industryOccupationIds = industryOccupations.map(io => io._id);

      // Get users with matching industry occupations
      const users = await User.find({ 
        isDeleted: false, 
        industryOccupation: { $in: industryOccupationIds } 
      })
        .select("_id online rating profilePic displayName industryOccupation pricing")
        .populate({
          path: "industryOccupation",
          populate: [
            { path: "level1Service", select: "name" },
            { path: "level2Service", select: "name" },
            { path: "level3Services", select: "name" }
          ]
        })
        .populate("pricing")
        .populate("basicInfo").populate({
          path: "expertise",
          populate: { path: "expertise" }
        })
        .populate({
          path: "language",
          populate: {path: "language"}
        });

      const transformedUsers = await Promise.all(
        users.map(async user => ({
          id: user?._id || "",
          online: user?.online || false,
          rating: user?.basicInfo?.rating || "",
          profilePic: user?.basicInfo?.profilePic || "",
          displayName: user?.basicInfo?.displayName || "",
          level1: user?.industryOccupation?.level1Service?.name || "",
          level2: user?.industryOccupation?.level2Service?.name || "",
          level3: user?.industryOccupation?.level3Services?.map(service => service.name) || [],
          language: user?.language?.language,
          expertise: user?.expertise?.expertise,
          pricing: user?.pricing || {
            _id: "",
            _v: 0,
            audioCallPrice: 0,
            messagePrice: 0,
            videoCallPrice: 0,
          },
        }))
      );

      resolve(transformedUsers);

    } catch (err) {
      console.error("Error in getUserByServiceLevel:", err);
      reject(err);
    }
  });
};