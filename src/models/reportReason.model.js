const mongoose = require("mongoose");

const reportReasonSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: true,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReportReason", reportReasonSchema);
