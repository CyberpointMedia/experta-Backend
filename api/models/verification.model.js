/**
 * Module: Verification Model
 * Info: Use for manage verification codes
 **/

// Import Module dependencies.
const { Schema, model } = require("mongoose");
const SchemaComposePlugin = require("./plugins/schemaComposer");
const ModelName = "Verification";

// Define Model Schema rules and options
const excludeOptions = {
  trackCreatedAt: true,
  trackUpdatedAt: true,
  trackDeletedAt: true,
};
const schemaRules = {
  contact: { type: String, required: true }, // Email or mobile number
  type: { type: String, enum: ["email", "phone"], required: true }, // Type of verification
  code: { type: String, required: true },
  expiredAt: { type: Date, default: Date.now },
  usedAt: { type: Date, default: null }, // manage code used or not
};

//Compose Model Schema
const ModelSchema = new Schema(schemaRules);

// Apply the common properties plugin to the Post schema
ModelSchema.plugin(SchemaComposePlugin, excludeOptions);

//Create model
const VerificationModel = model(ModelName, ModelSchema);

module.exports = VerificationModel;
