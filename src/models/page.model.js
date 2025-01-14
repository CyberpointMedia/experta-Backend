const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    title: { type: String, required: false },
    slug: { type: String, required: false },
    description: { type: String },
    seoTitle: { type: String, required: false },
    metaDescription: { type: String },
    allowInSearchResults: { type: Boolean, default: true },
    followLinks: { type: Boolean, default: true },
    metaRobots: { type: String },
    breadcrumbs: { type: String },
    canonicalURL: { type: String },
    isDeleted: { type: Boolean, default
    : false },
    status: {
      type: String,
      enum: ["published", "trash", "draft"], // Allowed values
      default: "draft",
    },

  },
  {
    timestamps: true,
  }
);
 pageSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { status: 'published' } });

module.exports = mongoose.model("Page", pageSchema);
