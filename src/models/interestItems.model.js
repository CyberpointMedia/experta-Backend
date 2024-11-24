const mongoose = require('mongoose');

const interestItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
      },
}, {
    timestamps: true,
});

module.exports = mongoose.model('InterestItem', interestItemSchema);