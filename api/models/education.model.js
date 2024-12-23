/**
 * Module: education Model
 * Info: Define education schema
 **/

// Import Module dependencies.
const mongoose = require("mongoose");
const { Schema } = mongoose;

const educationSchema = new Schema(
    {
        degree: {
        type: String,
        required: true,
        },
        schoolCollege: {
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
module.exports = mongoose.model("Education", educationSchema);