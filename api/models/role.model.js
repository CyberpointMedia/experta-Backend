const mongoose = require("mongoose");
const roleEnum = require("../enums/role.enum");

const roleSchema = new mongoose.Schema({

    _id: {
        type: String,
        unique: true,
        required: true,
        uppercase: true,
        maxlength: 10,
        trim: true,
        match: [/^[a-zA-Z]+$/, "It allows only characters: a-zA-Z"],
    },
    name: {
        type: String,
        required: true,
        unique: true,
        enum: Object.values(roleEnum),
    },
    displayName: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    },
    permissions:
        [{
            type: String,
            ref: "Permission"
        }],
    description: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model("Role", roleSchema);