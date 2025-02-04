const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      default: null,
      unique: true,
    },
    phoneNo: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    resendCount: {
      type: Number,
      default: 0,
      // required: true,
    },
    otp: String,
    otpExpiry: Date,
    block: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'BlockUser'
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isKycStatus:{
      type: Boolean,
      default: false,
    },
    // blockExpiry: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      // select: false, 
    },
    basicInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BasicInfo",
    },
    education: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Education",
      },
    ],
    industryOccupation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndustryOccupation",
    },
    workExperience: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkExperience",
      },
    ],
    intereset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Languages",
    },
    expertise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expertise",
    },
    pricing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pricing",
    },
    availability: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Availability",
      },
    ],
    noOfBooking: {
      type: Number,
    },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    online: {
      type: Boolean,
      default: false,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    profileCompletionPercentage: {
      type: Number,
      default: 0,
    },
    emailChangeOTP: String,
    emailChangeOTPExpiry: Date,
    newEmailRequest: String,
    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
    },
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }],
    authProvider: {
      type: String,
      enum: ['email', 'google', 'facebook', 'apple'],
      default: 'email'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.calculateProfileCompletion = function () {
  const sections = {
    basicInfo: { total: 5, completed: 0 },
    education: { total: 1, completed: 0 },
    industryOccupation: { total: 6, completed: 0 },
    workExperience: { total: 1, completed: 0 },
    interest: { total: 1, completed: 0 },
    language: { total: 1, completed: 0 },
    expertise: { total: 1, completed: 0 },
    pricing: { total: 2, completed: 0 },
    availability: { total: 1, completed: 0 },
  };
  let totalFields = 0;
  let completedFields = 0;

  if (this.basicInfo) {
    const basicInfoFields = [
      "firstName",
      "displayName",
      "bio",
      "profilePic",
      "rating",
    ];
    basicInfoFields.forEach((field) => {
      console.log(`Checking basicInfo field: ${field}, value: ${this.basicInfo[field]}`);
      if (this.basicInfo[field]) sections.basicInfo.completed++;
    });
  }

  if (this.education && this.education.length > 0) {
    console.log(`Checking education, value: ${this.education}`);
    sections.education.completed = 1;
  }

  if (this.industryOccupation) {
    console.log(`Checking industryOccupation, value: ${this.industryOccupation}`);
    if (this.industryOccupation.level1Service) {
      console.log(`Checking industryOccupation.level1Service, value: ${this.industryOccupation.level1Service}`);
      sections.industryOccupation.completed++;
    }
    if (this.industryOccupation.level2Service) {
      console.log(`Checking industryOccupation.level2Service, value: ${this.industryOccupation.level2Service}`);
      sections.industryOccupation.completed++;
    }
    if (this.industryOccupation.level3Services && this.industryOccupation.level3Services.length > 0) {
      console.log(`Checking industryOccupation.level3Services, value: ${this.industryOccupation.level3Services}`);
      sections.industryOccupation.completed++;
    }
    if (this.industryOccupation.registrationNumber) {
      console.log(`Checking industryOccupation.registrationNumber, value: ${this.industryOccupation.registrationNumber}`);
      sections.industryOccupation.completed++;
    }
    if (this.industryOccupation.certificate) {
      console.log(`Checking industryOccupation.certificate, value: ${this.industryOccupation.certificate}`);
      sections.industryOccupation.completed++;
    }
    if (this.industryOccupation.achievements && this.industryOccupation.achievements.length > 0) {
      console.log(`Checking industryOccupation.achievements, value: ${this.industryOccupation.achievements}`);
      sections.industryOccupation.completed++;
    }
  }

  if (this.workExperience && this.workExperience.length > 0) {
    console.log(`Checking workExperience, value: ${this.workExperience}`);
    sections.workExperience.completed = 1;
  }

  if (this.intereset && this.intereset.intereset && this.intereset.intereset.length > 0) {
    console.log(`Checking interest, value: ${this.intereset.intereset}`);
    sections.interest.completed = 1;
  }

  if (this.language && this.language.language && this.language.language.length > 0) {
    console.log(`Checking language, value: ${this.language.language}`);
    sections.language.completed = 1;
  }

  if (this.expertise && this.expertise.expertise && this.expertise.expertise.length > 0) {
    console.log(`Checking expertise, value: ${this.expertise.expertise}`);
    sections.expertise.completed = 1;
  }

  if (this.pricing) {
    if (this.pricing.audioCallPrice) {
      console.log(`Checking pricing.audioCallPrice, value: ${this.pricing.audioCallPrice}`);
      sections.pricing.completed++;
    }
    if (this.pricing.videoCallPrice) {
      console.log(`Checking pricing.videoCallPrice, value: ${this.pricing.videoCallPrice}`);
      sections.pricing.completed++;
    }
  }

  if (this.availability && this.availability.length > 0) {
    console.log(`Checking availability, value: ${this.availability}`);
    sections.availability.completed = 1;
  }

  Object.values(sections).forEach((section) => {
    totalFields += section.total;
    completedFields += section.completed;
  });

  const totalCompletionPercentage = Math.round(
    (completedFields / totalFields) * 100
  );

  console.log(`Total fields: ${totalFields}, Completed fields: ${completedFields}, Total completion percentage: ${totalCompletionPercentage}`);

  return {
    totalCompletionPercentage,
    sectionCompletions: Object.fromEntries(
      Object.entries(sections).map(([key, value]) => [
        key,
        Math.round((value.completed / value.total) * 100),
      ])
    ),
  };
};

module.exports = mongoose.model("User", userSchema);
