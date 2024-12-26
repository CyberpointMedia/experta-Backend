/**
 * Module: Ability Model
 * Info: Define abilities for role in the system for manage ACL(Access Control List)
 **/

// Import Module dependencies.
const { Schema } = require("mongoose");
const BaseModel = require("./base.model");
const ModelName = "Ability";

// Define Model Schema rules and options
const schemaRules = {
  title: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    maxlength: [20, "Input must be no longer than 20 characers"],
    trim: true,
    immutable: true,
  }, // define action or scope for access on resource
  resource: {
    type: String,
    trim: true,
  }, // Define entity like Post, Comment
  onlyOwned: {
    type: Boolean,
    default: 0,
  }, // Flag used for only owned user access
};
const ModelSchema = new Schema(schemaRules);

// Create model using discriminator
const AbilityModel = BaseModel.discriminator(ModelName, ModelSchema);

module.exports = AbilityModel;
