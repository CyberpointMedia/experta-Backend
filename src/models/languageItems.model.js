const mongoose = require('mongoose');

const languageItemSchema = new mongoose.Schema({
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

module.exports = mongoose.model('LanguageItem', languageItemSchema);