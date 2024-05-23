const mongoose = require('mongoose');

const industryOccupationSchema = new mongoose.Schema({
  industry: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
  },
  certificate: {
    type: String,
  },
  achievements:[{
    type: String,
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('IndustryOccupation', industryOccupationSchema);