// /models/IndustryOccupation.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const industryOccupationSchema = new mongoose.Schema({
  industry: {
    type: Schema.Types.ObjectId,
    ref: 'Industry',
    required: true,
  },
  occupation: {
    type: Schema.Types.ObjectId,
    ref: 'Occupation',
    required: true,
  },
  registrationNumber: {
    type: String,
  },
  certificate: {
    type: String,
  },
  achievements: [{
    type: String,
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('IndustryOccupation', industryOccupationSchema);
