/**
 * Module: Role Model
 * Info: Define roles in the system for manage ACL(Access Control List)
 **/

// Import Module dependencies.
const { Schema, model } = require("mongoose");
const SchemaComposePlugin = require("./plugins/schemaComposer");
const ModelName = "Role";

// Define Model Schema rules and options
const schemaOptions = {
  excludeCreatedAt: true,
  excludeUpdatedAt: true,
  excludeDeletedAt: true,
  fillableProperty: ["title", "name", "info", "abilities"],
  sortKeys: ["id", "title", "name"],
  defaultSortKey: "id",
};

const schemaRules = {
  title: {
    type: String,
    trim: true,
    maxlength: [50, "Input must be no longer than 50 characers"],
  },
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    maxlength: [20, "Input must be no longer than 20 characers"],
    trim: true,
    immutable: true,
    index: true,
  }, // define identifier for role
  priority: {
    type: Number,
    required: true,
  }, //Priority define access level. Lower number means higher priority
  parentRole: {
    type: Schema.Types.ObjectId,
    ref: ModelName,
  }, // Reference to parent role
  info: {
    type: String,
    maxlength: [100, "Input must be no longer than 100 characers"],
  },
  abilities: [
    {
      type: String,
      ref: "Ability",
    },
  ], // Array of abilities
  isAssigned: {
    type: Boolean,
    default: 0,
  }, // Flag to check role can be deleted if not assigned
  forSystem: {
    type: Boolean,
    immutable: true,
    default: 0,
  }, // Flag to check role for system users or not
};
const ModelSchema = new Schema(schemaRules);
// Apply the common properties plugin to the Post schema
ModelSchema.plugin(SchemaComposePlugin, schemaOptions);

/**
 * @method Filter Query for Resource Collection
 * @param {*} params Query parmas
 */

ModelSchema.statics.buildQuery = async (params) => {
  let Query = {};
  //Exclude Super Role
  Query.name = { $ne: "SUPERADMIN" };

  return Query;
};
// Create model
const Role = model(ModelName, ModelSchema);

module.exports = { Role };
