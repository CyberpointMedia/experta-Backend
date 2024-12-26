/**
 * Module: Schema Composer
 * Info:Plugin to share common methods & properties for other models and enforce hooks  to avoid conflicts
 **/

// Import Module dependencies.
const { Schema } = require("mongoose");

const SchemaComposer = (ModelSchema, excludeOptions = {}) => {
  // Manually manage timestamps
  ModelSchema.set("timestamps", false);

  //Add support for virtuals
  ModelSchema.set("toJSON", { virtuals: true });
  ModelSchema.set("toObject", { virtuals: true });

  //To manage and track create timestamp by default

  if (!excludeOptions.trackCreatedAt) {
    ModelSchema.add({
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    });
  }

  //To manage and track update timestamp by default
  if (!excludeOptions.trackUpdatedAt) {
    ModelSchema.add({
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    });
  }

  //To manage and track deleted timestamp by
  if (!excludeOptions.trackDeletedAt) {
    ModelSchema.add({
      deletedAt: { type: Date, default: Date.now },
      deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    });
  }

  /**
   * @method toJSON
   * Use for exclude field and transfrom JSON object for api
   */
  ModelSchema.methods.toJSON = function () {
    const obj = this.toObject({
      versionKey: false,
      transform: function (doc, ret) {
        // Remove the _id field and replace it with id
        ret.id = ret._id; // Create a new id field
        delete ret._id; // Remove the _id field
        return ret;
      },
    }); // Exclude __v
    return obj;
  };

  /**
   * @method softDelete
   * Use for soft delete feature in database to keep data
   * @param {mongoose.Schema.Types.ObjectId} activeUserID - Current logged user
   */
  ModelSchema.methods.softDelete = function (activeUserID) {
    this.deletedBy = activeUserID;
    this.deletedAt = Date.now();
    return this.save();
  };
};

module.exports = SchemaComposer;
