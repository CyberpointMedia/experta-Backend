/**
 * Module: Language Model
 * Info: Used to manage languages for selection
 **/

// Import Module dependencies.
const { Schema, model } = require("mongoose");
const SchemaComposePlugin = require("./plugins/schemaComposer");
const ModelName = "Language";

// Define Model Schema rules and options
const schemaOptions = {
  excludeCreatedAt: true,
  excludeUpdatedAt: true,
  excludeDeletedAt: true,
};
const schemaRules = {
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: [50, "Input must be no longer than 30 characers"],
  }, // Full name of the language (e.g., "English")
  code: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    maxlength: 5,
    immutable: true,
    index: true,
  }, // ISO 639-1 code (e.g., "en")
  isActive: { type: Boolean, default: true },
};

//Compose Model Schema
const ModelSchema = new Schema(schemaRules);

// Apply the common properties plugin to the Post schema
ModelSchema.plugin(SchemaComposePlugin, schemaOptions);

//Create model
const LanguageModel = model(ModelName, ModelSchema);

module.exports = LanguageModel;
