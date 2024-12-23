const mongoose = require("mongoose");
const { Schema } = mongoose;
const roleEnum = require("../enums/role.enum");

const roleSchema = Schema({
    // The unique identifier for the role. It must be a string of uppercase letters (A-Z) with a maximum length of 10 characters.
    _id: {
        type: String,
        unique: true,
        required: true,
        uppercase: true,
        maxlength: 10,
        trim: true,
        match: [/^[a-zA-Z]+$/, "It allows only characters: a-zA-Z"],
    },
    // The name of the role. It must be a unique, lowercase string.
    name: {
        type: String,
        required: true,
        unique: true,
        enum: Object.values(roleEnum),
    },
    // An optional display name for the role if the  user not wants to show the name then it can edit the name and this displayname is show .
    displayName: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    },
    // The permissions that are assigned to the role.
    permissions:
        [{
            type: String,
            ref: "Permission"
        }],
    // An optional description of the role.
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