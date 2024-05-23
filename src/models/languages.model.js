const mongoose = require('mongoose');

const languagesSchema = new mongoose.Schema({
  language: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LanguageItem',
    required: true,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Languages', languagesSchema);