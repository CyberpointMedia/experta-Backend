/**
 * Module: permissions Model
 * Info: Define permission schema
 **/

// Import Module dependencies.
const mongoose = require("mongoose");
const { Schema } = mongoose;

const permissionSchema =new Schema({
    _id:{
        type:String,
        unique:true,
        required:true,
        uppercase:true,
        maxlength:10,
        trim:true,
        match: [/^[a-zA-Z]+$/, "It allows only characters: a-zA-Z"],
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim:true,
        Lowercase:true,
    },
    description: {
        type: String,
        trim:true,
    }
}, { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports= mongoose.model("Permission", permissionSchema);

