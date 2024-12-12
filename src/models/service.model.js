
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    level: {
      type: Number,
      required: true,
      enum: [1, 2, 3]
    },
    icon: {
        type: String,
        required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }, {
    timestamps: true
  });

module.exports = mongoose.model("Service", serviceSchema);