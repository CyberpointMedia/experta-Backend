/**
 * Module: Interest Model
 * Info: Used for manage interest dropdown
 **/

// Import Module dependencies.
const { Schema, model } = require("mongoose");
const SchemaComposePlugin = require("./plugins/schemaComposer");
const ModelName = "Interest";

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
    maxlength: [50, "Input must be no longer than 50 characers"],
    index: true,
  }, // Full name of the language (e.g., "English")
  isActive: { type: Boolean, default: true },
};

//Compose Model Schema
const ModelSchema = new Schema(schemaRules);

// Apply the common properties plugin to the Post schema
ModelSchema.plugin(SchemaComposePlugin, schemaOptions);

//Create model
const InterestModel = model(ModelName, ModelSchema);

module.exports = InterestModel;
