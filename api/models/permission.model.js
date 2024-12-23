/**
 * Module: permissions Model
 * Info: Define permission schema
 **/

// Import Module dependencies.
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define permission schema
const permissionSchema =new Schema({ 
    // The unique identifier for the permission. It must be a string of uppercase letters (A-Z) with a maximum length of 10 characters.  
    _id:{
        type:String,
        unique:true,
        required:true,
        uppercase:true,
        maxlength:10,
        trim:true,
        match: [/^[a-zA-Z]+$/, "It allows only characters: a-zA-Z"],
    },
// The name of the permission. It must be a unique, lowercase string.
    name: {
        type: String,
        required: true,
        unique: true,
        trim:true,
        Lowercase:true,
    },
// An optional description of the permission.
    description: {
        type: String,
        trim:true,
    }
}, { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports= mongoose.model("Permission", permissionSchema);

