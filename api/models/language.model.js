/**
 * Module: Model
 * Info:
 **/

// Import Module dependencies.
const { Schema, model } = require("mongoose");
const SchemaComposePlugin = require("./plugins/schemaComposer");
const ModelName = "";

// Define Model Schema rules and options
const excludeOptions = {
  trackCreatedAt: true,
  trackUpdatedAt: true,
  trackDeletedAt: true,
};
const schemaRules = {
  name: { type: String, required: true, unique: true }, // Full name of the language (e.g., "English")
  code: { type: String, required: true, unique: true, maxlength: 5 }, // ISO 639-1 code (e.g., "en")
  isActive: { type: Boolean, default: true },
};

//Compose Model Schema
const ModelSchema = new Schema(schemaRules);

// Apply the common properties plugin to the Post schema
ModelSchema.plugin(SchemaComposePlugin, excludeOptions);

//Create model
const Model = model(ModelName, ModelSchema);

module.exports = Model;
