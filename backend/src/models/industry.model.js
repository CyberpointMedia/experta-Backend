// /models/Industry.js
const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:true
  },
  icon:{
    type:String,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Industry', industrySchema);
