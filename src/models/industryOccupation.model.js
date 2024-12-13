const mongoose = require('mongoose');
const industryOccupationSchema = new mongoose.Schema({
  level1Service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  level2Service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  level3Services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  registrationNumber: {
    type: String,
  },
  certificate: {
    type: String,
  },
  achievements: [{
    type: String,
  }],
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('IndustryOccupation', industryOccupationSchema);
