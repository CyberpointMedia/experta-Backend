const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'expert', 'user', 'moderator'],
    default: 'user'
  },
  permissions: [{
    type: String,
    required: true
  }],
  description: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);