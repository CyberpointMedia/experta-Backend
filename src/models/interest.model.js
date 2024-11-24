const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
  {
    intereset: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterestItem",
        required: true,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interest", interestSchema);
