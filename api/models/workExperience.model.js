/**
 * Module: workExperience Model
 * Info: Define workExperience schema
 **/

// Import Module dependencies.
const mongoose = require("mongoose");
const { Schema } = mongoose;

const workExperienceSchema = new Schema(
    {
        jobTitle: {
        type: String,
        required: true,
        },
        companyName: {
        type: String,
        required: true,
        },
        startDate: {
        type: Date,
        required: true,
        },
        endDate: {
        type: Date,
        required: true,
        },
        deletedAt: {
        type: Date,
        default: null,
        },
    },
    {
        timestamps: true,
    }
    );
module.exports = mongoose.model("WorkExperience", workExperienceSchema);