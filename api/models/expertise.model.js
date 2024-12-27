/**
 * Module: Expertise Model
 * Info: Used for manage expertise  dropdown
 **/

// Import Module dependencies.
const { Schema, model } = require("mongoose");
const SchemaComposePlugin = require("./plugins/schemaComposer");
const ModelName = "Expertise";

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
    maxlength: [50, "Input must be no longer than 50 characers"],
    index: true,
  }, // Full name of the language (e.g., "English")
  isActive: { type: Boolean, default: true },
};

//Compose Model Schema
const ModelSchema = new Schema(schemaRules);

// Apply the common properties plugin to the Post schema
ModelSchema.plugin(SchemaComposePlugin, excludeOptions);

//Create model
const ExpertiseModel = model(ModelName, ModelSchema);

module.exports = ExpertiseModel;
