const mongoose = require("mongoose");

const reportReasonSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReportReason", reportReasonSchema);
