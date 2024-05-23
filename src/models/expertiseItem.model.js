const mongoose = require('mongoose');

const expertiseItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ExpertiseItem', expertiseItemSchema);