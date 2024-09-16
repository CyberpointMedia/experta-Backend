const mongoose = require("mongoose");

const expertiseSchema = new mongoose.Schema(
  {
    expertise: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExpertiseItem",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expertise", expertiseSchema);
