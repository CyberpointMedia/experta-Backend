/**
 * Module: Model
 * Info:
 **/

// Import Module dependencies.
const { Schema, model } = require("mongoose");
const SchemaComposePlugin = require("./plugins/schemaComposer");
const ModelName = "State";

// Define Model Schema rules and options
const excludeOptions = {
  trackCreatedAt: true,
  trackUpdatedAt: true,
  trackDeletedAt: true,
};
const schemaRules = {
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: [20, "Input must be no longer than 20 characers"],
  }, // Full name of the state
  code: {
    type: String,
    required: true,
    unique: true,
    maxlength: [2, "Input must be 2 character code"],
    index: true,
    immutable: true,
  }, // 2-letter abbreviation
  countryCode: {
    type: String,
    maxlength: [2, "Input must be 2 character country code"],
    default: "IN",
  },
};

//Compose Model Schema
const ModelSchema = new Schema(schemaRules);

// Apply the common properties plugin to the Post schema
ModelSchema.plugin(SchemaComposePlugin, excludeOptions);

//Create model
const StateModel = model(ModelName, ModelSchema);

module.exports = StateModel;
