const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({

  about: {
    type: String, // Change the type to String
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('About', aboutSchema);
