const mongoose = require('mongoose');

const languagesSchema = new mongoose.Schema({
  language: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LanguageItem',
    required: true,
  }],
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Languages', languagesSchema);