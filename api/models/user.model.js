/**
 * Module: user Model
 * Info: Define user schema
 **/

// Import Module dependencies.
const { min, max } = require("moment");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        //The email address of the user. It must be a unique, lowercase string.
        email: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: [100, "Email must be less than 255 characters"],
            default: null,
        },
        // The phone number of the user. It must be a unique string of 10 digits.
        phone: {
            type: String,
            required: true,
            unique: true,
            minlength: [10, "Phone number must be 10 digits"],
            maxlength: [10, "Phone number must be 10 digits"],
        },
        //Take the user location during the login and store it in the location field.
        location: {
            type: String,
            trim: true,
            default: null,
        },
        //It show the how many time user try to login in the system . If the user try to login more than 5 times then the user account will be blocked and then after 15 min user can login.
        resendCount: {
            type: Number,
            default: 0,
            // required: true,
        },
        // The OTP code
        verificationToken: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VerificationToken",
        },
        // It save the user is blocked or not by the admin.
        block: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BlockUser'
        },
        //It show the time when the user is verified.
        verifiedAt:{
            type: Date,
            default: null,
        },
        //It show the delete status of the user if user is deleted then the isDeleted is set to true otherwise it is set to false.
        deletedAt: {
            type: Date,
            default: null,
        },
        //It store the baisc information of the user.
        basicInfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BasicInfo",
        },
        //It store the education information of the user.
        education: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Education",
            },
        ],
        //It store the industry and occupation information of the user.
        industryOccupation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "IndustryOccupation",
        },
        //It store the work experience information of the user
        workExperience: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "WorkExperience",
            },
        ],
        //It store the interest information of the user that which type of services user have intrest.
        intereset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interest",
        },
        //how many language user know
        language: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Languages",
        },
        //It store the expertise information of the user in which field the user is expert.
        expertise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expertise",
        },
        //It store the pricing information of the user that how much the user charge for the services.
        pricing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pricing",
        },
        //It store the availability information of the user that when the user is available for the services.
        availability: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Availability",
            },
        ],
        //Total number of booking done by the user.
        noOfBooking: {
            type: Number,
        },
        notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
        //It show the user is online or not if the user is online then it set to true otherwise it set to false.
        online: {
            type: Boolean,
            default: false,
        },
        //It show the all block user by the user.
        blockedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        //It show how much profile is completed by the user.
        profileCompletionPercentage: {
            type: Number,
            default: 0,
        },
        emailChangeOTP: String,
        emailChangeOTPExpiry: Date,
        newEmailRequest: String,
        //It show the how much balance user have in the wallet.
        wallet: {
            balance: {
                type: Number,
                default: 0,
            },
        },
        //It show the role that is assigned to the user.
        roles: {
            type: String,
            ref: 'Role'
        },
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
        basicInfo: { total: 6, completed: 0 },
        education: { total: 1, completed: 0 },
        industryOccupation: { total: 5, completed: 0 },
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
            "location",
            "rating",
        ];
        console.log("this.basicInfo", this.basicInfo);
        basicInfoFields.forEach((field) => {
            if (this.basicInfo[field]) sections.basicInfo.completed++;
        });
    }

    if (this.education && this.education.length > 0)
        sections.education.completed = 1;

    if (this.industryOccupation) {
        if (this.industryOccupation.industry)
            sections.industryOccupation.completed++;
        if (this.industryOccupation.occupation)
            sections.industryOccupation.completed++;
        if (this.industryOccupation.registrationNumber)
            sections.industryOccupation.completed++;
        if (this.industryOccupation.certificate)
            sections.industryOccupation.completed++;
        if (
            this.industryOccupation.achievements &&
            this.industryOccupation.achievements.length > 0
        )
            sections.industryOccupation.completed++;
    }

    if (this.workExperience && this.workExperience.length > 0)
        sections.workExperience.completed = 1;

    if (
        this.intereset &&
        this.intereset.intereset &&
        this.intereset.intereset.length > 0
    )
        sections.interest.completed = 1;

    if (
        this.language &&
        this.language.language &&
        this.language.language.length > 0
    )
        sections.language.completed = 1;

    if (
        this.expertise &&
        this.expertise.expertise &&
        this.expertise.expertise.length > 0
    )
        sections.expertise.completed = 1;

    if (this.pricing) {
        if (this.pricing.audioCallPrice) sections.pricing.completed++;
        if (this.pricing.videoCallPrice) sections.pricing.completed++;
    }

    if (this.availability && this.availability.length > 0)
        sections.availability.completed = 1;

    Object.values(sections).forEach((section) => {
        totalFields += section.total;
        completedFields += section.completed;
    });

    const totalCompletionPercentage = Math.round(
        (completedFields / totalFields) * 100
    );

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

const User = mongoose.model('User', userSchema);

module.exports = { User };
