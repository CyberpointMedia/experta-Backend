/**
 * Module: Ability Model
 * Info: Define abilities for role in the system for manage ACL(Access Control List)
 **/

// Import Module dependencies.
const { Schema } = require("mongoose");
const SchemaComposePlugin = require("./plugins/schemaComposer");
const ModelName = "Ability";

// Define Model Schema rules and options
const excludeOptions = {};
const schemaRules = {
  title: {
    type: String,
    trim: true,
    maxlength: [30, "Input must be no longer than 30 characers"],
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
    maxlength: [20, "Input must be no longer than 20 characers"],
    trim: true,
  }, // Define entity like Post, Comment
  onlyOwned: {
    type: Boolean,
    default: 0,
  }, // Flag used for only owned user access
};
const ModelSchema = new Schema(schemaRules);

// Apply the common properties plugin to the Post schema
ModelSchema.plugin(SchemaComposePlugin, excludeOptions);

//Create model
const AbilityModel = model(ModelName, ModelSchema);

module.exports = AbilityModel;
