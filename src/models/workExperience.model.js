const mongoose = require('mongoose');

const workExperienceSchema = new mongoose.Schema({
  workExperience: [{
    jobTitle: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    isCurrentlyWorking: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('WorkExperience', workExperienceSchema);