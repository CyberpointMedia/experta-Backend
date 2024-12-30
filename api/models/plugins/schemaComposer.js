/**
 * Module: Schema Composer
 * Info:Plugin to share common methods & properties for other models and enforce hooks  to avoid conflicts
 **/

// Import Module dependencies.
const { Schema } = require("mongoose");
const ModelError = require("../../utils/errors/modelError");

const SchemaComposer = (ModelSchema, schemaOptions = {}) => {
  // Manually manage timestamps
  ModelSchema.set("timestamps", false);

  //Add support for virtuals
  ModelSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
      // Remove the _id field and replace it with id
      ret.id = ret._id; // Create a new id field
      delete ret._id; // Remove the _id field
      delete ret.__v;
      return ret;
    },
  });
  ModelSchema.set("toObject", { virtuals: true });

  //To manage and track create timestamp by default

  if (!schemaOptions.excludeCreatedAt) {
    ModelSchema.add({
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    });
  }

  //To manage and track update timestamp by default
  if (!schemaOptions.excludeUpdatedAt) {
    ModelSchema.add({
      updatedAt: { type: Date, default: null },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    });
  }

  //To manage and track deleted timestamp by
  if (!schemaOptions.excludeDeletedAt) {
    ModelSchema.add({
      deletedAt: { type: Date, default: null },
      deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    });
  }

  // Add common properties
  ModelSchema.statics.fillable = schemaOptions.fillableProperty && schemaOptions.fillableProperty instanceof Array ? schemaOptions.fillableProperty : [];
  ModelSchema.statics.filterQuery = {};
  ModelSchema.statics.searchPayload = { data: [], metadata: {} };

  /**
   * @method softDelete
   * Use for soft delete feature in database to keep data
   * @param {mongoose.Schema.Types.ObjectId} activeUserID - Current logged user
   */
  ModelSchema.methods.softDelete = async function (activeUserID) {
    this.deletedBy = activeUserID;
    this.deletedAt = Date.now();
    return this.save();
  };

  /**
   * @method manageSearchPayload
   * Use for manage collection query payload with seach metadata
   * @param {JSON} filterQuery - Filter query used to manage find and count documents
   */
  ModelSchema.statics.manageSearchPayload = async function (filterQuery) {
    this.searchPayload.data = await this.find(filterQuery).exec();
    this.searchPayload.metadata.count = await this.countDocuments(filterQuery).lean().exec();
    return this.searchPayload;
  };

  /**
   * @method enforceFillableFields
   * Restrict to schema properties that can be provided by user
   * @param {json} payload - Request body
   */
  ModelSchema.statics.enforceFillableFields = async function (payload, privateFields) {
    if (!(this.fillable && this.fillable instanceof Array)) {
      throw new ModelError("No fillable properties found.");
    }
    let data = this.fillable.reduce((inputs, key) => {
      if (key in payload) {
        inputs[key] = payload[key];
      }
      return inputs;
    }, {});

    return {
      ...data,
      ...privateFields,
    };
  };
};

module.exports = SchemaComposer;
