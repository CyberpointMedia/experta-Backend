const mongoose = require('mongoose');

const languageItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('LanguageItem', languageItemSchema);