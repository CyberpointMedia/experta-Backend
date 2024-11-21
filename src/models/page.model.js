const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: false },
    slug: { type: String, required: false, unique: true },
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Page", pageSchema);
