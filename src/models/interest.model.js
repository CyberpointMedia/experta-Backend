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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interest", interestSchema);
