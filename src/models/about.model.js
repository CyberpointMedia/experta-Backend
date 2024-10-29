const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
  {
    about: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("About", aboutSchema);
