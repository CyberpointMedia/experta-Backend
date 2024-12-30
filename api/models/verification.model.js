/**
 * Module: Verification Model
 * Info: Use for manage verification codes
 **/

// Import Module dependencies.
const { Schema, model } = require("mongoose");
const SchemaComposePlugin = require("./plugins/schemaComposer");
const ModelName = "Verification";

// Define Model Schema rules and options
const schemaOptions = {
  excludeCreatedAt: true,
  excludeUpdatedAt: true,
  excludeDeletedAt: true,
};
const schemaRules = {
  contact: { type: String, required: true }, // Email or mobile number
  type: { type: String, enum: ["email", "phone"], required: true }, // Type of verification
  code: { type: String, required: true },
  expiredAt: { type: Date, required: true },
  usedAt: { type: Date, default: null }, // manage code used or not
};

//Compose Model Schema
const ModelSchema = new Schema(schemaRules);
// Define a compound unique index
ModelSchema.index({ contact: 1, code: 1, name: "unique_verify_code" }, { unique: true });

// Apply the common properties plugin to the Post schema
ModelSchema.plugin(SchemaComposePlugin, schemaOptions);

//Create model
const VerificationModel = model(ModelName, ModelSchema);

module.exports = VerificationModel;
